<?php

namespace App\Services;

use App\Enums\BusinessCategory;
use App\Enums\BusinessPermissionKey;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\InventoryBatch;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardService
{
    public function __construct(
        private readonly RevenueService $revenueService,
        private readonly ProductService $productService,
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
        $salesToday = $this->todaySalesCount($business);
        $revenueToday = $this->revenueService->todayRevenue($business);
        $expensesToday = $this->revenueService->todayExpenses($business);
        $profitToday = $revenueToday - $expensesToday;
        $pendingCredit = $this->pendingCredit($business);

        return [
            'role' => Role::Owner->value,
            'business' => $business,
            'stats' => [
                ['label' => 'Revenue today', 'value' => $this->money($revenueToday), 'trend' => 'Completed sales', 'sparkline' => $this->dailyRevenueSeries($business, 7)],
                ['label' => 'Net profit today', 'value' => $this->money($profitToday), 'trend' => $profitToday >= 0 ? 'Revenue minus expenses' : 'Costs above revenue', 'sparkline' => $this->dailyProfitSeries($business, 7)],
                ['label' => 'Sales today', 'value' => (string) $salesToday, 'trend' => 'POS transactions', 'sparkline' => $this->dailySalesCountSeries($business, 7)],
                ['label' => 'Pending credit', 'value' => $this->money($pendingCredit), 'trend' => 'Customer balance due', 'sparkline' => $this->dailyCreditSeries($business, 7)],
            ],
            'chart' => $this->dailyRevenueSeries($business, 14),
            'salesTrend' => $this->dailyRevenueSeries($business, 14),
            'paymentBreakdown' => $this->paymentBreakdown($business),
            'inventoryHealth' => $this->inventoryHealth($business),
            'customerInsights' => $this->customerInsights($business),
            'lowStock' => $this->lowStock($business),
            'expiringBatches' => $this->expiringBatches($business),
            'stagnantProducts' => $this->productService->previewForBusiness($business),
            'topProducts' => $this->topProducts($business),
            'recentActivity' => $this->recentActivity($business),
            'smartRecommendations' => $this->smartRecommendations($business),
            'nextSteps' => $this->nextStepsForCategory($business),
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
                ['label' => 'Active businesses', 'value' => (string) Business::query()->where('status', 'active')->count(), 'trend' => 'Subscription-led growth'],
            ],
            'chart' => $this->emptySeries(),
            'recentBusinesses' => Business::query()
                ->latest()
                ->take(5)
                ->get(['id', 'business_name', 'business_type', 'status', 'created_at']),
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

    private function pendingCredit(?Business $business): float
    {
        if (! $business || ! Schema::hasTable('customers')) {
            return 0.0;
        }

        return (float) Customer::query()
            ->where('business_id', $business->id)
            ->sum('current_balance');
    }

    /**
     * @return list<array{label: string, value: float}>
     */
    private function dailyRevenueSeries(?Business $business, int $days): array
    {
        if (! $business || ! Schema::hasTable('sales')) {
            return $this->datedEmptySeries($days);
        }

        $start = CarbonImmutable::today()->subDays($days - 1);
        $rows = Sale::query()
            ->selectRaw('DATE(sold_at) as day, SUM(grand_total) as total')
            ->where('business_id', $business->id)
            ->whereDate('sold_at', '>=', $start)
            ->groupBy('day')
            ->pluck('total', 'day');

        return $this->dateLabels($days)
            ->map(fn (CarbonImmutable $date): array => [
                'label' => $date->format('M j'),
                'value' => round((float) ($rows[$date->toDateString()] ?? 0), 2),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{label: string, value: float}>
     */
    private function dailyProfitSeries(?Business $business, int $days): array
    {
        if (! $business || ! Schema::hasTable('sales') || ! Schema::hasTable('expenses')) {
            return $this->datedEmptySeries($days);
        }

        $start = CarbonImmutable::today()->subDays($days - 1);
        $sales = Sale::query()
            ->selectRaw('DATE(sold_at) as day, SUM(grand_total) as total')
            ->where('business_id', $business->id)
            ->whereDate('sold_at', '>=', $start)
            ->groupBy('day')
            ->pluck('total', 'day');

        $expenses = Expense::query()
            ->selectRaw('DATE(expense_date) as day, SUM(amount) as total')
            ->where('business_id', $business->id)
            ->whereDate('expense_date', '>=', $start)
            ->groupBy('day')
            ->pluck('total', 'day');

        return $this->dateLabels($days)
            ->map(fn (CarbonImmutable $date): array => [
                'label' => $date->format('M j'),
                'value' => round((float) ($sales[$date->toDateString()] ?? 0) - (float) ($expenses[$date->toDateString()] ?? 0), 2),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{label: string, value: int}>
     */
    private function dailySalesCountSeries(?Business $business, int $days): array
    {
        if (! $business || ! Schema::hasTable('sales')) {
            return $this->datedEmptySeries($days);
        }

        $start = CarbonImmutable::today()->subDays($days - 1);
        $rows = Sale::query()
            ->selectRaw('DATE(sold_at) as day, COUNT(*) as total')
            ->where('business_id', $business->id)
            ->whereDate('sold_at', '>=', $start)
            ->groupBy('day')
            ->pluck('total', 'day');

        return $this->dateLabels($days)
            ->map(fn (CarbonImmutable $date): array => [
                'label' => $date->format('M j'),
                'value' => (int) ($rows[$date->toDateString()] ?? 0),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{label: string, value: float}>
     */
    private function dailyCreditSeries(?Business $business, int $days): array
    {
        if (! $business || ! Schema::hasTable('sales')) {
            return $this->datedEmptySeries($days);
        }

        $start = CarbonImmutable::today()->subDays($days - 1);
        $rows = Sale::query()
            ->selectRaw('DATE(sold_at) as day, SUM(credit_amount) as total')
            ->where('business_id', $business->id)
            ->whereDate('sold_at', '>=', $start)
            ->groupBy('day')
            ->pluck('total', 'day');

        return $this->dateLabels($days)
            ->map(fn (CarbonImmutable $date): array => [
                'label' => $date->format('M j'),
                'value' => round((float) ($rows[$date->toDateString()] ?? 0), 2),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array{cash: float, credit: float, vat: float, mobile: float}
     */
    private function paymentBreakdown(?Business $business): array
    {
        if (! $business || ! Schema::hasTable('sales')) {
            return ['cash' => 0.0, 'credit' => 0.0, 'vat' => 0.0, 'mobile' => 0.0];
        }

        $start = today()->subDays(29);

        return [
            'cash' => round((float) Sale::query()->where('business_id', $business->id)->whereDate('sold_at', '>=', $start)->sum('cash_amount'), 2),
            'credit' => round((float) Sale::query()->where('business_id', $business->id)->whereDate('sold_at', '>=', $start)->sum('credit_amount'), 2),
            'vat' => round((float) Sale::query()->where('business_id', $business->id)->whereDate('sold_at', '>=', $start)->sum('tax_amount'), 2),
            'mobile' => Schema::hasTable('payments') ? round((float) Payment::query()
                ->where('business_id', $business->id)
                ->where('status', PaymentStatus::Completed->value)
                ->whereDate('paid_at', '>=', $start)
                ->where('method', '!=', 'cash')
                ->sum('amount'), 2) : 0.0,
        ];
    }

    /**
     * @return array{low_stock: int, out_of_stock: int, expiring_batches: int, inventory_cost_value: string, inventory_selling_value: string}
     */
    private function inventoryHealth(?Business $business): array
    {
        if (! $business || ! Schema::hasTable('products') || ! Schema::hasTable('inventory')) {
            return ['low_stock' => 0, 'out_of_stock' => 0, 'expiring_batches' => 0, 'inventory_cost_value' => $this->money(0), 'inventory_selling_value' => $this->money(0)];
        }

        $lowStock = Product::query()
            ->where('business_id', $business->id)
            ->whereHas('inventory', fn ($query) => $query->whereColumn('available_stock', '<=', 'products.reorder_level'))
            ->count();

        $outOfStock = Product::query()
            ->where('business_id', $business->id)
            ->whereHas('inventory', fn ($query) => $query->where('available_stock', '<=', 0))
            ->count();

        $expiringBatches = Schema::hasTable('inventory_batches')
            ? InventoryBatch::query()
                ->where('business_id', $business->id)
                ->whereNotNull('expiry_date')
                ->whereDate('expiry_date', '>=', today())
                ->whereDate('expiry_date', '<=', today()->addDays(30))
                ->where('quantity_remaining', '>', 0)
                ->count()
            : 0;

        $values = Schema::hasTable('inventory_batches')
            ? InventoryBatch::query()
                ->where('business_id', $business->id)
                ->selectRaw('SUM(quantity_remaining * unit_cost) as cost_value, SUM(quantity_remaining * selling_price) as selling_value')
                ->first()
            : null;

        return [
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
            'expiring_batches' => $expiringBatches,
            'inventory_cost_value' => $this->money((float) ($values?->cost_value ?? 0)),
            'inventory_selling_value' => $this->money((float) ($values?->selling_value ?? 0)),
        ];
    }

    /**
     * @return array{total: int, new_this_month: int, pending_credit: string, credit_customers: int}
     */
    private function customerInsights(?Business $business): array
    {
        if (! $business || ! Schema::hasTable('customers')) {
            return ['total' => 0, 'new_this_month' => 0, 'pending_credit' => $this->money(0), 'credit_customers' => 0];
        }

        return [
            'total' => Customer::query()->where('business_id', $business->id)->count(),
            'new_this_month' => Customer::query()->where('business_id', $business->id)->whereDate('created_at', '>=', now()->startOfMonth())->count(),
            'pending_credit' => $this->money($this->pendingCredit($business)),
            'credit_customers' => Customer::query()->where('business_id', $business->id)->where('current_balance', '>', 0)->count(),
        ];
    }

    /**
     * @return list<array{name: string, quantity: int, revenue: string, raw_revenue: float}>
     */
    private function topProducts(?Business $business): array
    {
        if (! $business || ! Schema::hasTable('sale_items')) {
            return [];
        }

        return SaleItem::query()
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->join('products', 'products.id', '=', 'sale_items.product_id')
            ->where('sales.business_id', $business->id)
            ->whereDate('sales.sold_at', '>=', today()->subDays(29))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc(DB::raw('SUM(sale_items.line_total)'))
            ->take(5)
            ->get([
                'products.name',
                DB::raw('SUM(sale_items.quantity) as quantity'),
                DB::raw('SUM(sale_items.line_total) as revenue'),
            ])
            ->map(fn ($row): array => [
                'name' => $row->name,
                'quantity' => (int) $row->quantity,
                'revenue' => $this->money((float) $row->revenue),
                'raw_revenue' => round((float) $row->revenue, 2),
            ])
            ->all();
    }

    /**
     * @return list<array{name: string, batch: string, quantity: int, expiry_date: string}>
     */
    private function expiringBatches(?Business $business): array
    {
        if (! $business || ! Schema::hasTable('inventory_batches')) {
            return [];
        }

        return InventoryBatch::query()
            ->with('product:id,name')
            ->where('business_id', $business->id)
            ->whereNotNull('expiry_date')
            ->whereDate('expiry_date', '>=', today())
            ->whereDate('expiry_date', '<=', today()->addDays(30))
            ->where('quantity_remaining', '>', 0)
            ->orderBy('expiry_date')
            ->take(5)
            ->get()
            ->map(fn (InventoryBatch $batch): array => [
                'name' => $batch->product?->name ?? 'Unknown product',
                'batch' => $batch->batch_number,
                'quantity' => (int) $batch->quantity_remaining,
                'expiry_date' => $batch->expiry_date?->format('M j, Y') ?? '',
            ])
            ->all();
    }

    /**
     * @return list<array{type: string, title: string, description: string, time: string}>
     */
    private function recentActivity(?Business $business): array
    {
        if (! $business) {
            return [];
        }

        $items = collect();

        if (Schema::hasTable('sales')) {
            Sale::query()
                ->with('customer:id,display_name,full_name')
                ->where('business_id', $business->id)
                ->latest('sold_at')
                ->take(4)
                ->get()
                ->each(fn (Sale $sale) => $items->push([
                    'type' => 'sale',
                    'title' => 'Sale '.$sale->invoice_number,
                    'description' => $this->money((float) $sale->grand_total).' sold'.($sale->customer ? ' to '.($sale->customer->display_name ?? $sale->customer->full_name) : ''),
                    'time' => $sale->sold_at?->diffForHumans() ?? $sale->created_at->diffForHumans(),
                    'at' => $sale->sold_at ?? $sale->created_at,
                ]));
        }

        if (Schema::hasTable('payments')) {
            Payment::query()
                ->where('business_id', $business->id)
                ->latest('paid_at')
                ->take(4)
                ->get()
                ->each(fn (Payment $payment) => $items->push([
                    'type' => 'payment',
                    'title' => 'Payment '.$payment->payment_number,
                    'description' => $this->money((float) $payment->amount).' via '.$payment->method->label(),
                    'time' => ($payment->paid_at ?? $payment->created_at)->diffForHumans(),
                    'at' => $payment->paid_at ?? $payment->created_at,
                ]));
        }

        if (Schema::hasTable('expenses')) {
            Expense::query()
                ->where('business_id', $business->id)
                ->latest('expense_date')
                ->take(4)
                ->get()
                ->each(fn (Expense $expense) => $items->push([
                    'type' => 'expense',
                    'title' => $expense->title,
                    'description' => $this->money((float) $expense->amount).' expense',
                    'time' => $expense->expense_date?->diffForHumans() ?? $expense->created_at->diffForHumans(),
                    'at' => $expense->expense_date ?? $expense->created_at,
                ]));
        }

        return $items
            ->sortByDesc('at')
            ->take(6)
            ->map(fn (array $item): array => collect($item)->except('at')->all())
            ->values()
            ->all();
    }

    /**
     * @return list<string>
     */
    private function smartRecommendations(?Business $business): array
    {
        if (! $business) {
            return ['Complete business setup to unlock operational recommendations.'];
        }

        $recommendations = [];
        $inventory = $this->inventoryHealth($business);
        $pendingCredit = $this->pendingCredit($business);
        $stagnantCount = count($this->productService->previewForBusiness($business));

        if ($inventory['low_stock'] > 0) {
            $recommendations[] = $inventory['low_stock'].' products are below reorder level. Restock the fastest-moving items first.';
        }

        if ($inventory['expiring_batches'] > 0) {
            $recommendations[] = $inventory['expiring_batches'].' batches expire within 30 days. Prioritize sales or discounts before loss.';
        }

        if ($pendingCredit > 0) {
            $recommendations[] = $this->money($pendingCredit).' is outstanding customer credit. Follow up before extending more credit.';
        }

        if ($stagnantCount > 0) {
            $recommendations[] = $stagnantCount.' stocked products have no recent sales. Consider bundling or promotional pricing.';
        }

        return $recommendations ?: ['Your core indicators look stable today. Review product performance and keep stock levels fresh.'];
    }

    /**
     * @return Collection<int, CarbonImmutable>
     */
    private function dateLabels(int $days): Collection
    {
        $start = CarbonImmutable::today()->subDays($days - 1);

        return collect(range(0, $days - 1))->map(fn (int $offset) => $start->addDays($offset));
    }

    /**
     * @return list<array{label: string, value: int}>
     */
    private function datedEmptySeries(int $days): array
    {
        return $this->dateLabels($days)
            ->map(fn (CarbonImmutable $date): array => ['label' => $date->format('M j'), 'value' => 0])
            ->values()
            ->all();
    }

    private function nextStepsForCategory(?Business $business): array
    {
        return match ($business?->business_category) {
            BusinessCategory::Restaurant => [
                'Set up menu categories',
                'Track ingredients and fast-moving items',
                'Review daily order revenue',
            ],
            BusinessCategory::OnlineStore => [
                'Add shippable product catalog',
                'Monitor pending payments',
                'Track repeat online customers',
            ],
            BusinessCategory::ServiceBusiness => [
                'Register recurring customers',
                'Track service payments',
                'Review monthly expenses and payroll',
            ],
            BusinessCategory::Pharmacy => [
                'Track expiring inventory batches',
                'Watch low-stock medicines',
                'Review product profit by batch cost',
            ],
            default => [
                'Complete product categories',
                'Add products and opening stock',
                'Create employee accounts before POS rollout',
            ],
        };
    }
}
