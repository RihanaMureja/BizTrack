<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Expense;
use App\Models\Sale;
use Illuminate\Support\Facades\Schema;

class RevenueService
{
    public function todayRevenue(?Business $business = null): float
    {
        if (! Schema::hasTable('sales')) {
            return 0.0;
        }

        return (float) Sale::query()
            ->when($business, fn ($query) => $query->where('business_id', $business->id))
            ->whereDate('sold_at', today())
            ->sum('grand_total');
    }

    public function todayExpenses(?Business $business = null): float
    {
        if (! Schema::hasTable('expenses')) {
            return 0.0;
        }

        return (float) Expense::query()
            ->when($business, fn ($query) => $query->where('business_id', $business->id))
            ->whereDate('expense_date', today())
            ->sum('amount');
    }

    public function todayProfit(?Business $business = null): float
    {
        return $this->todayRevenue($business) - $this->todayExpenses($business);
    }
}
