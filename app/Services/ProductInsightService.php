<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Enums\ProductInsightStatus;
use App\Enums\ProductInsightType;
use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Product;
use App\Models\ProductMovementInsight;
use App\Models\SaleItem;
use App\Notifications\StagnantProductNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ProductInsightService
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function detectForBusiness(Business $business): int
    {
        $preferences = $this->preferencesFor($business);

        if (! $preferences['enabled']) {
            return 0;
        }

        $created = 0;

        Product::query()
            ->with('inventory')
            ->where('business_id', $business->id)
            ->where('status', RecordStatus::Active)
            ->whereHas('inventory', fn (Builder $query) => $query->where('available_stock', '>=', $preferences['minimum_stock']))
            ->chunkById(100, function (Collection $products) use ($business, $preferences, &$created): void {
                foreach ($products as $product) {
                    $lastSoldAt = $this->lastSoldAt($product);
                    $daysWithoutSale = $lastSoldAt
                        ? (int) $lastSoldAt->startOfDay()->diffInDays(now()->startOfDay())
                        : max($preferences['threshold_days'], (int) $product->created_at->startOfDay()->diffInDays(now()->startOfDay()));

                    if ($daysWithoutSale < $preferences['threshold_days']) {
                        $this->resolveIfMoving($product);
                        continue;
                    }

                    $insight = ProductMovementInsight::query()->updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'type' => ProductInsightType::Stagnant,
                            'status' => ProductInsightStatus::Open,
                        ],
                        [
                            'business_id' => $business->id,
                            'days_without_sale' => $daysWithoutSale,
                            'threshold_days' => $preferences['threshold_days'],
                            'stock_on_hand' => (int) ($product->inventory?->available_stock ?? 0),
                            'last_sold_at' => $lastSoldAt,
                            'detected_at' => now(),
                            'suggested_action' => $this->suggestedAction($product, $daysWithoutSale),
                        ],
                    );

                    if ($insight->wasRecentlyCreated) {
                        $created++;
                    }

                    $this->notifyOwnerIfDue($business, $insight, $preferences['frequency_days']);
                }
            });

        return $created;
    }

    public function detectAll(): int
    {
        return Business::query()
            ->with('owner')
            ->get()
            ->sum(fn (Business $business): int => $this->detectForBusiness($business));
    }

    public function paginateForBusiness(Business $business, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return ProductMovementInsight::query()
            ->with(['product.category', 'product.inventory'])
            ->where('business_id', $business->id)
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->whereHas('product', fn (Builder $productQuery) => $productQuery
                ->where('name', 'like', '%'.$search.'%')
                ->orWhere('barcode', 'like', '%'.$search.'%')))
            ->latest('detected_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function previewForBusiness(?Business $business, int $limit = 5): array
    {
        if (! $business) {
            return [];
        }

        return ProductMovementInsight::query()
            ->with('product')
            ->where('business_id', $business->id)
            ->where('type', ProductInsightType::Stagnant)
            ->where('status', ProductInsightStatus::Open)
            ->latest('detected_at')
            ->take($limit)
            ->get()
            ->map(fn (ProductMovementInsight $insight): array => [
                'id' => $insight->id,
                'name' => $insight->product?->name ?? 'Unknown product',
                'days_without_sale' => $insight->days_without_sale,
                'stock_on_hand' => $insight->stock_on_hand,
                'suggested_action' => $insight->suggested_action,
            ])
            ->all();
    }

    public function updateStatus(ProductMovementInsight $insight, ProductInsightStatus $status): ProductMovementInsight
    {
        $insight->forceFill([
            'status' => $status,
            'dismissed_at' => $status === ProductInsightStatus::Dismissed ? now() : $insight->dismissed_at,
            'resolved_at' => $status === ProductInsightStatus::Resolved ? now() : $insight->resolved_at,
        ])->save();

        return $insight->refresh();
    }

    public function preferencesFor(Business $business): array
    {
        $preferences = $business->owner?->preferences ?? [];

        return [
            'enabled' => (bool) ($preferences['notify_stagnant_products'] ?? true),
            'threshold_days' => max(1, (int) ($preferences['stagnant_product_days'] ?? 30)),
            'minimum_stock' => max(0, (int) ($preferences['stagnant_product_minimum_stock'] ?? 1)),
            'frequency_days' => max(1, (int) ($preferences['stagnant_product_notification_frequency'] ?? 7)),
        ];
    }

    private function lastSoldAt(Product $product): ?Carbon
    {
        $soldAt = SaleItem::query()
            ->where('product_id', $product->id)
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->max('sales.sold_at');

        return $soldAt ? Carbon::parse($soldAt) : null;
    }

    private function resolveIfMoving(Product $product): void
    {
        ProductMovementInsight::query()
            ->where('product_id', $product->id)
            ->where('type', ProductInsightType::Stagnant)
            ->where('status', ProductInsightStatus::Open)
            ->update([
                'status' => ProductInsightStatus::Resolved,
                'resolved_at' => now(),
                'updated_at' => now(),
            ]);
    }

    private function notifyOwnerIfDue(Business $business, ProductMovementInsight $insight, int $frequencyDays): void
    {
        $owner = $business->owner;

        if (! $owner || ($owner->preferences['notify_stagnant_products'] ?? true) === false) {
            return;
        }

        if ($insight->notified_at && $insight->notified_at->gt(now()->subDays($frequencyDays))) {
            return;
        }

        $this->notificationService->create(
            $business,
            $owner,
            NotificationType::StagnantProduct,
            'Stagnant product detected',
            ($insight->product?->name ?? 'A product').' has not sold for '.$insight->days_without_sale.' days. '.$insight->suggested_action,
        );

        $owner->notify(new StagnantProductNotification($insight->loadMissing('product')));

        $insight->forceFill(['notified_at' => now()])->save();
    }

    private function suggestedAction(Product $product, int $daysWithoutSale): string
    {
        return match (true) {
            $daysWithoutSale >= 90 => 'Consider discounting, bundling, or discontinuing this item.',
            $daysWithoutSale >= 60 => 'Review pricing and promote it in the next sales cycle.',
            default => 'Consider a small promotion or better shelf placement.',
        };
    }
}
