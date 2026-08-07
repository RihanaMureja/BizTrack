<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\CustomerCreditProfile;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Collection;

class CreditScoringService
{
    public function profilesForBusiness(Business $business): Collection
    {
        return Customer::query()
            ->where('business_id', $business->id)
            ->orderBy('display_name')
            ->get()
            ->map(fn (Customer $customer) => $this->syncProfile($customer));
    }

    public function syncProfile(Customer $customer): CustomerCreditProfile
    {
        $sales = Sale::query()
            ->where('business_id', $customer->business_id)
            ->where('customer_id', $customer->id)
            ->orderBy('sold_at')
            ->get(['id', 'grand_total', 'sold_at']);

        $credits = CustomerCredit::query()
            ->where('business_id', $customer->business_id)
            ->where('customer_id', $customer->id)
            ->get(['remaining_balance', 'due_date', 'paid_at']);

        $totalPurchaseVolume = (float) $sales->sum('grand_total');
        $averageOrderValue = $sales->count() > 0 ? (float) $sales->avg('grand_total') : 0.0;
        $firstSale = $sales->first()?->sold_at;
        $tenureDays = $firstSale ? max(1, (int) $firstSale->diffInDays(now())) : 0;
        $settledCredits = $credits->filter(fn (CustomerCredit $credit): bool => $credit->paid_at !== null);
        $onTimePayments = $settledCredits->filter(fn (CustomerCredit $credit): bool => $credit->due_date === null || $credit->paid_at?->lessThanOrEqualTo($credit->due_date))->count();
        $onTimeRate = $settledCredits->count() > 0 ? round(($onTimePayments / $settledCredits->count()) * 100, 2) : 0.0;
        $suggestedLimit = $this->suggestedLimit($totalPurchaseVolume, $averageOrderValue, $onTimeRate, $tenureDays);

        return CustomerCreditProfile::updateOrCreate(
            [
                'business_id' => $customer->business_id,
                'customer_id' => $customer->id,
            ],
            [
                'suggested_credit_limit' => $suggestedLimit,
                'owner_credit_limit_override' => (float) $customer->credit_limit > 0 ? (float) $customer->credit_limit : null,
                'total_purchase_volume' => $totalPurchaseVolume,
                'on_time_payment_rate' => $onTimeRate,
                'average_order_value' => $averageOrderValue,
                'customer_tenure_days' => $tenureDays,
                'calculated_at' => now(),
            ],
        )->load('customer');
    }

    private function suggestedLimit(float $totalPurchaseVolume, float $averageOrderValue, float $onTimeRate, int $tenureDays): float
    {
        if ($totalPurchaseVolume <= 0) {
            return 0.0;
        }

        $base = max($averageOrderValue * 2, $totalPurchaseVolume * 0.15);
        $punctualityFactor = match (true) {
            $onTimeRate >= 90 => 1.25,
            $onTimeRate >= 70 => 1.0,
            $onTimeRate > 0 => 0.75,
            default => 0.6,
        };
        $tenureFactor = $tenureDays >= 180 ? 1.15 : ($tenureDays >= 60 ? 1.0 : 0.8);

        return round($base * $punctualityFactor * $tenureFactor, 2);
    }
}
