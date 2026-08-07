<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\Business;
use App\Models\Sale;

class CustomerCreditService
{
    /** @return array{completed_on_time: int, completed_late: int, overdue_count: int, total_credits_issued: int, reliability_score: int} */
    public function paymentHistoryFor(Customer $customer): array
    {
        $credits = CustomerCredit::query()->where('customer_id', $customer->id);
        $total = (clone $credits)->count();
        $onTime = (clone $credits)
            ->where('status', PaymentStatus::Completed->value)
            ->whereColumn('paid_at', '<=', 'due_date')
            ->count();
        $late = (clone $credits)
            ->where('status', PaymentStatus::Completed->value)
            ->whereColumn('paid_at', '>', 'due_date')
            ->count();
        $overdue = (clone $credits)->where('status', PaymentStatus::Overdue->value)->count();
        $score = round((($onTime * 2 - $overdue * 3) / max(1, $total)) * 50 + 50);

        return [
            'completed_on_time' => $onTime,
            'completed_late' => $late,
            'overdue_count' => $overdue,
            'total_credits_issued' => $total,
            'reliability_score' => max(0, min(100, (int) $score)),
        ];
    }

    public function syncForSale(Sale $sale): ?CustomerCredit
    {
        if (! $sale->customer_id) {
            return null;
        }

        $sale = $sale->refresh();
        $creditAmount = (float) $sale->grand_total;
        $paidAmount = min((float) $sale->paid_amount, $creditAmount);
        $remainingBalance = max(0, $creditAmount - $paidAmount);
        $existing = CustomerCredit::query()
            ->where('business_id', $sale->business_id)
            ->where('sale_id', $sale->id)
            ->first();

        if (! $existing && $remainingBalance <= 0) {
            $customer = $this->syncCustomerBalance($sale->customer);
            app(CustomerCreditPolicyService::class)->evaluate($customer);

            return null;
        }

        $status = $this->statusFor($remainingBalance, $paidAmount, $existing?->due_date);

        $credit = CustomerCredit::updateOrCreate(
            [
                'business_id' => $sale->business_id,
                'sale_id' => $sale->id,
            ],
            [
                'customer_id' => $sale->customer_id,
                'credit_amount' => $creditAmount,
                'paid_amount' => $paidAmount,
                'remaining_balance' => $remainingBalance,
                'status' => $status,
                'due_date' => $existing?->due_date ?? today()->addDays(30),
                'paid_at' => $remainingBalance <= 0 ? now() : null,
            ],
        );

        $customer = $this->syncCustomerBalance($sale->customer);
        app(CustomerCreditPolicyService::class)->evaluate($customer);

        return $credit->refresh();
    }

    public function markOverdue(CustomerCredit $credit): CustomerCredit
    {
        if ((float) $credit->remaining_balance <= 0) {
            return $credit;
        }

        $credit->forceFill(['status' => PaymentStatus::Overdue])->save();
        app(CustomerCreditPolicyService::class)->evaluate($credit->customer()->firstOrFail());

        return $credit->refresh();
    }

    public function markPastDueCredits(): int
    {
        return CustomerCredit::query()
            ->where('remaining_balance', '>', 0)
            ->whereDate('due_date', '<', today())
            ->where('status', '!=', PaymentStatus::Overdue->value)
            ->update(['status' => PaymentStatus::Overdue->value, 'updated_at' => now()]);
    }

    public function markPastDueCreditsForBusiness(Business $business): int
    {
        return CustomerCredit::query()
            ->where('business_id', $business->id)
            ->where('remaining_balance', '>', 0)
            ->whereDate('due_date', '<', today())
            ->where('status', '!=', PaymentStatus::Overdue->value)
            ->update(['status' => PaymentStatus::Overdue->value, 'updated_at' => now()]);
    }

    public function syncCustomerBalance(Customer $customer): Customer
    {
        $balance = CustomerCredit::query()
            ->where('customer_id', $customer->id)
            ->where('remaining_balance', '>', 0)
            ->sum('remaining_balance');

        $customer->forceFill(['current_balance' => $balance])->save();

        return $customer->refresh();
    }

    private function statusFor(float $remainingBalance, float $paidAmount, mixed $dueDate): PaymentStatus
    {
        if ($remainingBalance <= 0) {
            return PaymentStatus::Completed;
        }

        if ($dueDate && $dueDate->isPast() && ! $dueDate->isToday()) {
            return PaymentStatus::Overdue;
        }

        return $paidAmount > 0 ? PaymentStatus::Partial : PaymentStatus::Unpaid;
    }
}
