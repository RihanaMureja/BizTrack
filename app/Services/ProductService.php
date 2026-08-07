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

class ProductService
{
    public function __construct(
        private readonly NotificationService $notificationService,
        private readonly ProductCodeGeneratorService $productCodeGenerator,
    ) {}

    public function paginateForBusiness(
        Business $business,
        ?string $search = null,
        ?int $categoryId = null,
        ?string $status = null,
        ?string $sort = null,
        int $perPage = 10,
    ): LengthAwarePaginator {
        $products = Product::query()
            ->with(['category', 'inventory', 'movementInsights' => fn ($query) => $query
                ->where('status', ProductInsightStatus::Open)
                ->latest('detected_at')])
            ->where('business_id', $business->id)
            ->when($search, function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('barcode', 'like', '%'.$search.'%');
                });
            })
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->when($status, fn ($query) => $query->where('status', $status));

        match ($sort) {
            'name' => $products->orderBy('name'),
            'price_high' => $products->orderByDesc('selling_price'),
            'price_low' => $products->orderBy('selling_price'),
            'stock_low' => $products
                ->leftJoin('inventory', 'inventory.product_id', '=', 'products.id')
                ->select('products.*')
                ->orderBy('inventory.available_stock'),
            default => $products->latest('products.created_at'),
        };

        return $products
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Product $product) => $this->attachCatalogMetrics($product));
    }

    public function detailForBusiness(Business $business, Product $product): Product
    {
        abort_unless($product->business_id === $business->id, 403);

        return $this->attachCatalogMetrics($product->load([
            'category',
            'inventory',
            'movementInsights' => fn ($query) => $query->latest('detected_at'),
        ]));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Business $business, array $data): Product
    {
        $barcode = $this->productCodeGenerator->barcodeFor($business);

        return Product::create([
            ...$data,
            'business_id' => $business->id,
            'barcode' => $barcode,
            'qr_payload' => $this->productCodeGenerator->qrPayloadFor($business, $barcode),
        ])->load(['category', 'inventory']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Product $product, array $data): Product
    {
        if (($data['barcode'] ?? $product->barcode) !== $product->barcode && $product->saleItems()->exists()) {
            abort(422, 'Barcode cannot be changed after this product has been sold.');
        }

        if (($data['qr_payload'] ?? $product->qr_payload) !== $product->qr_payload && $product->saleItems()->exists()) {
            abort(422, 'QR payload cannot be changed after this product has been sold.');
        }

        unset($data['barcode'], $data['qr_payload']);

        $product->update($data);

        return $product->refresh()->load(['category', 'inventory']);
    }

    public function deactivate(Product $product): Product
    {
        $product->update(['status' => RecordStatus::Inactive]);

        return $product->refresh();
    }

    public function updateInsightStatus(ProductMovementInsight $insight, ProductInsightStatus $status): ProductMovementInsight
    {
        $insight->forceFill([
            'status' => $status,
            'dismissed_at' => $status === ProductInsightStatus::Dismissed ? now() : $insight->dismissed_at,
            'resolved_at' => $status === ProductInsightStatus::Resolved ? now() : $insight->resolved_at,
        ])->save();

        return $insight->refresh();
    }

    public function detectForBusiness(Business $business): int
    {
        $preferences = $this->insightPreferencesFor($business);

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

    public function insightPreferencesFor(Business $business): array
    {
        $preferences = $business->owner?->preferences ?? [];

        return [
            'enabled' => (bool) ($preferences['notify_stagnant_products'] ?? true),
            'threshold_days' => max(1, (int) ($preferences['stagnant_product_days'] ?? 30)),
            'minimum_stock' => max(0, (int) ($preferences['stagnant_product_minimum_stock'] ?? 1)),
            'frequency_days' => max(1, (int) ($preferences['stagnant_product_notification_frequency'] ?? 7)),
        ];
    }

    private function attachCatalogMetrics(Product $product): Product
    {
        $product->setAttribute('sales_trend', $this->salesTrend($product));
        $product->setAttribute('open_insight', $product->movementInsights
            ->first(fn (ProductMovementInsight $insight) => $insight->status === ProductInsightStatus::Open));

        return $product;
    }

    private function salesTrend(Product $product): array
    {
        $start = now()->subDays(29)->startOfDay();
        $sales = SaleItem::query()
            ->selectRaw('DATE(sales.sold_at) as sold_date, SUM(sale_items.quantity) as units')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sale_items.product_id', $product->id)
            ->where('sales.sold_at', '>=', $start)
            ->groupBy('sold_date')
            ->pluck('units', 'sold_date');

        return collect(range(0, 29))
            ->map(function (int $offset) use ($start, $sales): array {
                $date = $start->copy()->addDays($offset)->toDateString();

                return [
                    'date' => $date,
                    'units' => (int) ($sales[$date] ?? 0),
                ];
            })
            ->all();
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
