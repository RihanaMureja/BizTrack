<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Customer;
use App\Models\SaleItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DiscountService
{
    public function __construct(private readonly CustomerCreditPolicyService $customerCreditPolicyService) {}

    /**
     * @param Collection<int, array{product: mixed, quantity: int, lineTotal: float}> $items
     * @return array{type: ?string, value: float, rule_id: ?string, amount: float}
     */
    public function calculate(Business $business, Collection $items, ?Customer $customer = null): array
    {
        $rules = collect($business->owner?->preferences['discount_rules'] ?? []);
        $best = ['type' => null, 'value' => 0.0, 'rule_id' => null, 'amount' => 0.0];

        foreach ($rules as $index => $rule) {
            if (! is_array($rule) || ! in_array($rule['type'] ?? null, ['percentage', 'fixed', 'buy_x_get_y'], true)) {
                continue;
            }

            $productId = $rule['product_id'] ?? null;
            $matching = $items->filter(fn (array $item): bool => ! $productId || $item['product']->id === (int) $productId);
            $subtotal = (float) $matching->sum('lineTotal');
            $value = max(0, (float) ($rule['value'] ?? 0));
            $amount = match ($rule['type']) {
                'percentage' => $subtotal * min($value, 100) / 100,
                'fixed' => min($value, $subtotal),
                'buy_x_get_y' => $matching->sum(function (array $item) use ($value): float {
                    $buy = max(1, (int) $value);
                    $free = max(1, (int) ($rule['free_quantity'] ?? 1));
                    return floor($item['quantity'] / ($buy + $free)) * (float) $item['product']->selling_price * $free;
                }),
            };

            if ($amount > $best['amount']) {
                $best = ['type' => $rule['type'], 'value' => $value, 'rule_id' => (string) ($rule['id'] ?? $index), 'amount' => round($amount, 2)];
            }
        }

        $stagnantDays = max(1, (int) ($business->owner?->preferences['stagnant_product_days'] ?? 30));
        $stagnantRate = min(100, max(0, (float) ($business->owner?->preferences['stagnant_product_discount_percentage'] ?? 10)));
        $cutoff = Carbon::now()->subDays($stagnantDays);
        $stagnantAmount = $items->sum(function (array $item) use ($cutoff, $stagnantRate): float {
            $product = $item['product'];
            $hasRecentSale = SaleItem::query()
                ->where('product_id', $product->id)
                ->whereHas('sale', fn ($query) => $query->where('sold_at', '>=', $cutoff))
                ->exists();

            return $product->created_at?->lte($cutoff) && ! $hasRecentSale
                ? $item['lineTotal'] * $stagnantRate / 100
                : 0;
        });

        if ($stagnantAmount > $best['amount']) {
            $best = ['type' => 'stagnant_product', 'value' => $stagnantRate, 'rule_id' => 'stagnant-product', 'amount' => round($stagnantAmount, 2)];
        }

        $customerDiscount = $customer ? $this->customerCreditPolicyService->discountFor($customer) : 0.0;
        $customerAmount = $items->sum('lineTotal') * $customerDiscount / 100;

        if ($customerAmount > $best['amount']) {
            $best = ['type' => 'customer_credit_policy', 'value' => $customerDiscount, 'rule_id' => 'customer-credit-policy', 'amount' => round($customerAmount, 2)];
        }

        return $best;
    }
}
