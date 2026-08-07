<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Customer;
use App\Models\DiscountRule;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Collection;

class DiscountEngineService
{
    public function rulesForBusiness(Business $business): Collection
    {
        return DiscountRule::query()
            ->where('business_id', $business->id)
            ->orderBy('spend_threshold')
            ->get();
    }

    public function createRule(Business $business, array $data): DiscountRule
    {
        return DiscountRule::create([
            ...$data,
            'business_id' => $business->id,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);
    }

    public function updateRule(DiscountRule $rule, array $data): DiscountRule
    {
        $rule->update([
            ...$data,
            'is_active' => (bool) ($data['is_active'] ?? false),
        ]);

        return $rule->refresh();
    }

    public function deleteRule(DiscountRule $rule): void
    {
        $rule->delete();
    }

    public function previewForCustomer(Customer $customer, ?float $subtotal = null): array
    {
        $rule = $this->matchingRule($customer);
        $discountAmount = $rule && $subtotal !== null
            ? round($subtotal * ((float) $rule->discount_percent / 100), 2)
            : 0.0;

        return [
            'rule_id' => $rule?->id,
            'rule_name' => $rule?->name,
            'discount_percent' => $rule ? (float) $rule->discount_percent : 0.0,
            'discount_amount' => $discountAmount,
            'qualifying_spend' => $this->qualifyingSpend($customer),
        ];
    }

    public function automaticDiscount(Customer $customer, float $subtotal): float
    {
        $rule = $this->matchingRule($customer);

        return $rule ? round($subtotal * ((float) $rule->discount_percent / 100), 2) : 0.0;
    }

    private function matchingRule(Customer $customer): ?DiscountRule
    {
        $spend = $this->qualifyingSpend($customer);

        return DiscountRule::query()
            ->where('business_id', $customer->business_id)
            ->where('is_active', true)
            ->where('spend_threshold', '<=', $spend)
            ->orderByDesc('spend_threshold')
            ->orderByDesc('discount_percent')
            ->first();
    }

    private function qualifyingSpend(Customer $customer): float
    {
        return (float) Sale::query()
            ->where('business_id', $customer->business_id)
            ->where('customer_id', $customer->id)
            ->where('sold_at', '>=', now()->subDays(30))
            ->sum('grand_total');
    }
}
