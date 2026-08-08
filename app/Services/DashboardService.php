<?php

namespace App\Services;

use App\Enums\Role;
use App\Enums\BusinessPermissionKey;
use App\Helpers\BusinessDashboardConfig;
use App\Models\Business;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardService
{
    public function __construct(
        private readonly RevenueService $revenueService,
        private readonly ProductInsightService $productInsightService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function forUser(User $user): array
    {
        return match ($user->role) {
            Role::SuperAdmin => $this->superAdminDashboard(),
            Role::Owner => $this->ownerDashboard($user),
            Role::Cashier => $this->cashierDashboard($user),
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function ownerDashboard(User $user): array
    {
        $business = $user->ownedBusiness ?? $user->business;
        $config = BusinessDashboardConfig::for($business?->business_type);

        $stats = $this->ownerStats($business);
        $orderedStats = array_values(
            array_map(
                fn (array $spec): array => $stats[$spec['key']],
                $config['stats'],
            ),
        );

        return [
            'role' => Role::Owner->value,
            'business' => $business,
            'businessType' => $business?->business_type,
            'focus' => $config['focus'],
            'subtitle' => $config['subtitle'],
            'sections' => $config['sections'],
            'stats' => $orderedStats,
            'chart' => $this->emptySeries(),
            'lowStock' => $this->lowStock($business),
            'stagnantProducts' => $this->productInsightService->previewForBusiness($business),
            'expiringProducts' => $this->expiringProducts($business),
            'stockValue' => $this->stockValue($business),
            'topProducts' => $this->topProducts($business),
            'nextSteps' => [
                'Complete product categories',
                'Add products and opening stock',
                'Create cashier accounts before POS rollout',
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function cashierDashboard(User $user): array
    {
        if (! $user->hasBusinessPermission(BusinessPermissionKey::ViewDashboard)) {
            return [
                'role' => Role::Cashier->value,
                'business' => $user->business,
                'stats' => [],
                'chart' => $this->emptySeries(),
                'queue' => [
                    'Use the sidebar to open the modules your business owner assigned to you.',
                    'Ask the owner for dashboard access if you need daily business summaries.',
                ],
            ];
        }

        return [
            'role' => Role::Cashier->value,
            'business' => $user->business,
            'stats' => [
                ['label' => 'Today sales', 'value' => (string) $this->todaySalesCount($user->business), 'trend' => 'POS activity'],
                ['label' => 'Transactions', 'value' => (string) $this->todaySalesCount($user->business), 'trend' => 'Completed today'],
                ['label' => 'Customers', 'value' => (string) $this->businessCount(Customer::class, $user->business), 'trend' => 'Available customers'],
                ['label' => 'Receipts', 'value' => (string) $this->todaySalesCount($user->business), 'trend' => 'Ready to view'],
            ],
            'chart' => $this->emptySeries(),
            'queue' => [
                'Open POS for the next customer',
                'Register walk-in customers',
                'Review pending payments',
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function superAdminDashboard(): array
    {
        return [
            'role' => Role::SuperAdmin->value,
            'stats' => [
                ['label' => 'Businesses', 'value' => (string) Business::count(), 'trend' => 'Registered workspaces'],
                ['label' => 'Users', 'value' => (string) User::count(), 'trend' => 'Platform accounts'],
                ['label' => 'Subscriptions', 'value' => (string) Subscription::count(), 'trend' => 'Available plans'],
                ['label' => 'Sales', 'value' => (string) Sale::count(), 'trend' => 'Recorded transactions'],
            ],
            'chart' => $this->emptySeries(),
            'recentBusinesses' => Business::query()
                ->latest()
                ->take(5)
                ->get(['id', 'business_name', 'business_type', 'status', 'created_at']),
        ];
    }

    /**
     * Build the full stat pool and pick the ordered subset for the owner.
     *
     * @return array<string, array{key: string, label: string, value: string, trend: string}>
     */
    private function ownerStats(?Business $business): array
    {
        return [
            'revenue_today' => ['key' => 'revenue_today', 'label' => 'Revenue today', 'value' => $this->money($this->revenueService->todayRevenue($business)), 'trend' => 'Completed sales'],
            'sales_today' => ['key' => 'sales_today', 'label' => 'Sales today', 'value' => (string) $this->todaySalesCount($business), 'trend' => 'POS activity'],
            'expenses_today' => ['key' => 'expenses_today', 'label' => 'Expenses today', 'value' => $this->money($this->revenueService->todayExpenses($business)), 'trend' => 'Recorded costs'],
            'products' => ['key' => 'products', 'label' => 'Products', 'value' => (string) $this->businessCount(Product::class, $business), 'trend' => 'Active catalog items'],
            'low_stock' => ['key' => 'low_stock', 'label' => 'Low stock', 'value' => (string) count($this->lowStock($business)), 'trend' => 'Items to reorder'],
            'expiring_soon' => ['key' => 'expiring_soon', 'label' => 'Expiring soon', 'value' => (string) count($this->expiringProducts($business)), 'trend' => 'Within 30 days'],
            'stock_value' => ['key' => 'stock_value', 'label' => 'Stock value', 'value' => $this->money($this->stockValue($business)['total']), 'trend' => 'Cost on hand'],
            'stagnant_count' => ['key' => 'stagnant_count', 'label' => 'Stagnant', 'value' => (string) count($this->productInsightService->previewForBusiness($business)), 'trend' => 'Need attention'],
        ];
    }

    private function businessCount(string $modelClass, ?Business $business): int
    {
        if (! $business) {
            return 0;
        }

        return $modelClass::query()->where('business_id', $business->id)->count();
    }

    private function todaySalesCount(?Business $business): int
    {
        if (! $business || ! Schema::hasTable('sales')) {
            return 0;
        }

        return Sale::query()
            ->where('business_id', $business->id)
            ->whereDate('sold_at', today())
            ->count();
    }

    /**
     * @return list<array{name: string, stock: int, reorder: int}>
     */
    private function lowStock(?Business $business): array
    {
        if (! $business) {
            return [];
        }

        return Product::query()
            ->with('inventory')
            ->where('business_id', $business->id)
            ->whereHas('inventory', fn ($query) => $query->whereColumn('available_stock', '<=', 'products.reorder_level'))
            ->take(5)
            ->get()
            ->map(fn (Product $product): array => [
                'name' => $product->name,
                'stock' => (int) ($product->inventory?->available_stock ?? 0),
                'reorder' => (int) $product->reorder_level,
            ])
            ->all();
    }

    /**
     * Products with batch stock expiring within the next 30 days.
     *
     * @return list<array{name: string, quantity: int, days_left: int, expires_at: string}>
     */
    private function expiringProducts(?Business $business): array
    {
        if (! $business || ! Schema::hasTable('inventory_batches')) {
            return [];
        }

        return InventoryBatch::query()
            ->with('product')
            ->where('business_id', $business->id)
            ->where('remaining_quantity', '>', 0)
            ->whereNotNull('expires_at')
            ->whereBetween('expires_at', [today(), today()->addDays(30)])
            ->orderBy('expires_at')
            ->take(5)
            ->get()
            ->map(fn (InventoryBatch $batch): array => [
                'name' => $batch->product?->name ?? 'Unknown product',
                'quantity' => (int) $batch->remaining_quantity,
                'days_left' => (int) today()->diffInDays($batch->expires_at, false),
                'expires_at' => $batch->expires_at?->toDateString() ?? '',
            ])
            ->all();
    }

    /**
     * Total cost value of remaining batch stock plus the highest-value products.
     *
     * @return array{total: float, items: list<array{name: string, value: float}>}
     */
    private function stockValue(?Business $business): array
    {
        if (! $business || ! Schema::hasTable('inventory_batches')) {
            return ['total' => 0.0, 'items' => []];
        }

        $rows = InventoryBatch::query()
            ->with('product')
            ->where('business_id', $business->id)
            ->where('remaining_quantity', '>', 0)
            ->where('unit_cost', '>', 0)
            ->get(['product_id', 'remaining_quantity', 'unit_cost']);

        $valuePerProduct = [];

        foreach ($rows as $batch) {
            $value = (float) $batch->remaining_quantity * (float) $batch->unit_cost;
            $productId = $batch->product_id;
            $valuePerProduct[$productId] = ($valuePerProduct[$productId] ?? 0.0) + $value;
        }

        arsort($valuePerProduct);

        $total = array_sum($valuePerProduct);

        $items = collect($rows->unique('product_id'))
            ->filter(fn (InventoryBatch $batch) => isset($valuePerProduct[$batch->product_id]) && $valuePerProduct[$batch->product_id] > 0)
            ->sortByDesc(fn (InventoryBatch $batch) => $valuePerProduct[$batch->product_id])
            ->take(5)
            ->values()
            ->map(fn (InventoryBatch $batch): array => [
                'name' => $batch->product?->name ?? 'Unknown product',
                'value' => round($valuePerProduct[$batch->product_id], 2),
            ])
            ->all();

        return ['total' => round($total, 2), 'items' => $items];
    }

    /**
     * Best-selling products by total sold quantity.
     *
     * @return list<array{name: string, quantity: int}>
     */
    private function topProducts(?Business $business): array
    {
        if (! $business || ! Schema::hasTable('sale_items')) {
            return [];
        }

        return SaleItem::query()
            ->with('product')
            ->whereHas('sale', fn ($query) => $query->where('business_id', $business->id))
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get()
            ->map(fn (SaleItem $item): array => [
                'name' => $item->product?->name ?? 'Unknown product',
                'quantity' => (int) $item->total_quantity,
            ])
            ->all();
    }

    /**
     * @return list<array{label: string, value: int}>
     */
    private function emptySeries(): array
    {
        return [
            ['label' => 'Mon', 'value' => 0],
            ['label' => 'Tue', 'value' => 0],
            ['label' => 'Wed', 'value' => 0],
            ['label' => 'Thu', 'value' => 0],
            ['label' => 'Fri', 'value' => 0],
            ['label' => 'Sat', 'value' => 0],
            ['label' => 'Sun', 'value' => 0],
        ];
    }

    private function money(float $amount): string
    {
        return number_format($amount, 2).' ETB';
    }
}
