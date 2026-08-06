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
use App\Notifications\ExpiringProductNotification;
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
            ->whereHas('inventory', fn(Builder $query) => $query->where('available_stock', '>=', $preferences['minimum_stock']))
            ->chunkById(100, function (Collection $products) use ($business, $preferences, &$created): void {
                foreach ($products as $product) {
                    $lastSoldAt = $this->lastSoldAt($product);
                    $daysWithoutSale = $lastSoldAt
                        ? (int) $lastSoldAt->startOfDay()->diffInDays(now()->startOfDay())
                        : max($preferences['threshold_days'], (int) $product->created_at->startOfDay()->diffInDays(now()->startOfDay()));

                    if ($daysWithoutSale < $preferences['threshold_days']) {
                        $this->resolveIfMoving($product, ProductInsightType::Stagnant);
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

    public function detectExpiringForBusiness(Business $business): int
    {
        $preferences = $this->preferencesFor($business);

        if (! $preferences['expiring_enabled']) {
            return 0;
        }

        $created = 0;

        Product::query()
            ->with('inventory')
            ->where('business_id', $business->id)
            ->where('status', RecordStatus::Active)
            ->chunkById(100, function (Collection $products) use ($business, $preferences, &$created): void {
                foreach ($products as $product) {
                    $daysUntilExpiry = $product->expire_date
                        ? (int) now()->startOfDay()->diffInDays(Carbon::parse($product->expire_date)->startOfDay(), false)
                        : null;

                    if ($daysUntilExpiry === null || $daysUntilExpiry < 0) {
                        $this->resolveIfMoving($product, ProductInsightType::Expiring);
                        continue;
                    }

                    if ($daysUntilExpiry > $preferences['expiry_alert_days']) {
                        $this->resolveIfMoving($product, ProductInsightType::Expiring);
                        continue;
                    }

                    $insight = ProductMovementInsight::query()->updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'type' => ProductInsightType::Expiring,
                            'status' => ProductInsightStatus::Open,
                        ],
                        [
                            'business_id' => $business->id,
                            'days_without_sale' => $daysUntilExpiry,
                            'threshold_days' => $preferences['expiry_alert_days'],
                            'stock_on_hand' => (int) ($product->inventory?->available_stock ?? 0),
                            'detected_at' => now(),
                            'suggested_action' => $this->suggestedExpiryAction($daysUntilExpiry),
                        ],
                    );

                    if ($insight->wasRecentlyCreated) {
                        $created++;
                    }

                    $this->notifyOwnerIfDue($business, $insight, $preferences['expiry_notification_frequency'], ProductInsightType::Expiring);
                }
            });

        return $created;
    }

    public function detectExpiringForProduct(Product $product): int
    {
        $business = $product->business;

        if (! $business) {
            return 0;
        }

        $preferences = $this->preferencesFor($business);

        if (! $preferences['expiring_enabled']) {
            return 0;
        }

        $daysUntilExpiry = $product->expire_date
            ? (int) now()->startOfDay()->diffInDays(Carbon::parse($product->expire_date)->startOfDay(), false)
            : null;

        if ($daysUntilExpiry === null || $daysUntilExpiry < 0 || $daysUntilExpiry > $preferences['expiry_alert_days']) {
            $this->resolveIfMoving($product, ProductInsightType::Expiring);

            return 0;
        }

        $insight = ProductMovementInsight::query()->updateOrCreate(
            [
                'product_id' => $product->id,
                'type' => ProductInsightType::Expiring,
                'status' => ProductInsightStatus::Open,
            ],
            [
                'business_id' => $business->id,
                'days_without_sale' => $daysUntilExpiry,
                'threshold_days' => $preferences['expiry_alert_days'],
                'stock_on_hand' => (int) ($product->inventory?->available_stock ?? 0),
                'detected_at' => now(),
                'suggested_action' => $this->suggestedExpiryAction($daysUntilExpiry),
            ],
        );

        $created = $insight->wasRecentlyCreated ? 1 : 0;
        $this->notifyOwnerIfDue($business, $insight, $preferences['expiry_notification_frequency'], ProductInsightType::Expiring);

        return $created;
    }

    public function detectExpiringAll(): int
    {
        return Business::query()
            ->with('owner')
            ->get()
            ->sum(fn(Business $business): int => $this->detectExpiringForBusiness($business));
    }

    public function detectAll(): int
    {
        return Business::query()
            ->with('owner')
            ->get()
            ->sum(fn(Business $business): int => $this->detectForBusiness($business));
    }

    public function paginateForBusiness(Business $business, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $type = $filters['type'] ?? null;

        return $this->paginateForType($business, $type ? ProductInsightType::from($type) : null, $filters, $perPage);
    }

    public function paginateForType(?Business $business, ?ProductInsightType $type, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = ProductMovementInsight::query()
            ->with(['product.category', 'product.inventory'])
            ->where('business_id', $business?->id);

        if ($type !== null) {
            $query->where('type', $type);
        }

        $query
            ->when($filters['status'] ?? null, fn(Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn(Builder $query, string $search) => $query->whereHas('product', fn(Builder $productQuery) => $productQuery
                ->where('name', 'like', '%' . $search . '%')
                ->orWhere('barcode', 'like', '%' . $search . '%')))
            ->latest('detected_at');

        return $query->paginate($perPage)->withQueryString();
    }

    public function previewForBusiness(?Business $business, int $limit = 5, ?ProductInsightType $type = null): array
    {
        if (! $business) {
            return [];
        }

        $query = ProductMovementInsight::query()
            ->with('product')
            ->where('business_id', $business->id)
            ->where('status', ProductInsightStatus::Open);

        if ($type !== null) {
            $query->where('type', $type);
        }

        return $query
            ->latest('detected_at')
            ->take($limit)
            ->get()
            ->map(fn(ProductMovementInsight $insight): array => [
                'id' => $insight->id,
                'name' => $insight->product?->name ?? 'Unknown product',
                'days_without_sale' => $insight->days_without_sale,
                'stock_on_hand' => $insight->stock_on_hand,
                'suggested_action' => $insight->suggested_action,
                'type' => $insight->type?->value,
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
            'expiring_enabled' => (bool) ($preferences['notify_stagnant_products'] ?? true),
            'expiry_alert_days' => max(1, (int) ($preferences['expiry_alert_days'] ?? 30)),
            'expiry_notification_frequency' => max(1, (int) ($preferences['expiry_notification_frequency'] ?? 7)),
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

    private function resolveIfMoving(Product $product, ?ProductInsightType $type = null): void
    {
        $query = ProductMovementInsight::query()
            ->where('product_id', $product->id)
            ->where('status', ProductInsightStatus::Open);

        if ($type !== null) {
            $query->where('type', $type);
        }

        $query->update([
            'status' => ProductInsightStatus::Resolved,
            'resolved_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function notifyOwnerIfDue(Business $business, ProductMovementInsight $insight, int $frequencyDays, ?ProductInsightType $type = null): void
    {
        $owner = $business->owner;

        if (! $owner) {
            return;
        }

        $notifyPreference = match ($type) {
            ProductInsightType::Expiring => $owner->preferences['notify_stagnant_products'] ?? true,
            default => $owner->preferences['notify_stagnant_products'] ?? true,
        };

        if ($notifyPreference === false) {
            return;
        }

        if ($insight->notified_at && $insight->notified_at->gt(now()->subDays($frequencyDays))) {
            return;
        }

        $notificationType = $type === ProductInsightType::Expiring ? NotificationType::ExpiringProduct : NotificationType::StagnantProduct;
        $title = $type === ProductInsightType::Expiring ? 'Product nearing expiry' : 'Stagnant product detected';
        $notification = $this->notificationService->create(
            $business,
            $owner,
            $notificationType,
            $title,
            ($insight->product?->name ?? 'A product') . ' ' . ($type === ProductInsightType::Expiring ? 'is nearing expiry.' : 'has not sold for ' . $insight->days_without_sale . ' days.') . ($insight->suggested_action ? ' ' . $insight->suggested_action : ''),
        );

        $owner->notify($type === ProductInsightType::Expiring
            ? new ExpiringProductNotification($insight->loadMissing('product'))
            : new StagnantProductNotification($insight->loadMissing('product')));

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

    private function suggestedExpiryAction(int $daysUntilExpiry): string
    {
        return match (true) {
            $daysUntilExpiry <= 7 => 'Discount or bundle now — expires in ' . $daysUntilExpiry . ' days.',
            $daysUntilExpiry <= 30 => 'Plan a promotion before this expires in ' . $daysUntilExpiry . ' days.',
            default => 'Review pricing and prepare a promotion before this expires.',
        };
    }
}
