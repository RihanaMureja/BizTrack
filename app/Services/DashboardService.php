<?php

namespace App\Services;

use App\Enums\Role;
use App\Enums\BusinessPermissionKey;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Sale;
use App\Models\ServiceFee;
use App\Models\Subscription;
use App\Models\User;
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

        return [
            'role' => Role::Owner->value,
            'business' => $business,
            'stats' => [
                ['label' => 'Revenue today', 'value' => $this->money($this->revenueService->todayRevenue($business)), 'trend' => 'Completed sales'],
                ['label' => 'Sales today', 'value' => (string) $this->todaySalesCount($business), 'trend' => 'POS activity'],
                ['label' => 'Expenses today', 'value' => $this->money($this->revenueService->todayExpenses($business)), 'trend' => 'Recorded costs'],
                ['label' => 'Service fees owed', 'value' => $this->money($this->serviceFeesOwed($business)), 'trend' => 'BizTrack platform balance'],
            ],
            'chart' => $this->emptySeries(),
            'lowStock' => $this->lowStock($business),
            'stagnantProducts' => $this->productInsightService->previewForBusiness($business),
            'topProducts' => [],
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
                ['label' => 'Service revenue', 'value' => $this->money($this->platformServiceRevenue()), 'trend' => 'Paid platform fees'],
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

    private function serviceFeesOwed(?Business $business): float
    {
        if (! $business || ! Schema::hasTable('service_fees')) {
            return 0;
        }

        return (float) ServiceFee::query()
            ->where('business_id', $business->id)
            ->where('status', 'unpaid')
            ->sum('fee_amount');
    }

    private function platformServiceRevenue(): float
    {
        if (! Schema::hasTable('service_fees')) {
            return 0;
        }

        return (float) ServiceFee::query()
            ->where('status', 'paid')
            ->sum('fee_amount');
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
}
