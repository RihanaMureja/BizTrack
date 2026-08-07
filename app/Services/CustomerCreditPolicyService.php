<?php

namespace App\Services;

use App\Models\Customer;

class CustomerCreditPolicyService
{
    public function __construct(
        private readonly CustomerCreditService $customerCreditService,
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Apply the first matching credit-limit policy rule, in the owner's configured order.
     */
    public function evaluate(Customer $customer): void
    {
        $customer->loadMissing('business.owner');
        $history = $this->customerCreditService->paymentHistoryFor($customer);
        $oldLimit = (float) $customer->credit_limit;
        $newLimit = $oldLimit;

        foreach ($this->rulesFor($customer) as $rule) {
            if (! $this->matches($rule, $history)) {
                continue;
            }

            $value = max(0, (float) ($rule['action_value'] ?? 0));
            $newLimit = match ($rule['action'] ?? null) {
                'increase_limit_percent' => $oldLimit * (1 + $value / 100),
                'decrease_limit_percent' => $oldLimit * max(0, 1 - $value / 100),
                // As the first matching rule, freeze prevents later increase rules from applying.
                'freeze_limit' => $oldLimit,
                default => $oldLimit,
            };
            break;
        }

        $newLimit = round(max((float) $customer->current_balance, 0, $newLimit), 2);

        if (round($oldLimit, 2) === $newLimit) {
            return;
        }

        $customer->forceFill(['credit_limit' => $newLimit])->save();
        $this->auditLogService->record(
            'credit_limit.auto_adjusted',
            'customers',
            $customer->id,
            ['credit_limit' => $oldLimit],
            ['credit_limit' => $newLimit],
        );
    }

    public function discountFor(Customer $customer): float
    {
        $history = $this->customerCreditService->paymentHistoryFor($customer);

        return collect($this->rulesFor($customer))
            ->filter(fn (array $rule): bool => ($rule['action'] ?? null) === 'discount_percent' && $this->matches($rule, $history))
            ->max(fn (array $rule): float => min(100, max(0, (float) ($rule['action_value'] ?? 0)))) ?? 0.0;
    }

    /** @return array<int, array<string, mixed>> */
    private function rulesFor(Customer $customer): array
    {
        $rules = $customer->business?->owner?->preferences['credit_policy_rules'] ?? [];

        return is_array($rules) ? $rules : [];
    }

    /** @param array<string, mixed> $rule @param array<string, int|float> $history */
    private function matches(array $rule, array $history): bool
    {
        $value = (float) ($rule['value'] ?? 0);

        return match ($rule['condition'] ?? null) {
            'reliability_score_gte' => $history['reliability_score'] >= $value,
            'overdue_count_gte' => $history['overdue_count'] >= $value,
            'completed_on_time_gte' => $history['completed_on_time'] >= $value,
            default => false,
        };
    }
}
