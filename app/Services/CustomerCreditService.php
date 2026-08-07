<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\Sale;

class CustomerCreditService
{
    public function __construct(private readonly CreditScoringService $creditScoringService) {}

    public function syncForSale(Sale $sale): ?CustomerCredit
    {
        if (! $sale->customer_id) {
            return null;
        }

        $sale = $sale->refresh();
        $existing = CustomerCredit::query()
            ->where('business_id', $sale->business_id)
            ->where('sale_id', $sale->id)
            ->first();

        if (! $sale->is_credit_sale && ! $existing) {
            $this->syncCustomerBalance($sale->customer);

            return null;
        }

        $creditAmount = (float) $sale->grand_total;
        $paidAmount = min((float) $sale->paid_amount, $creditAmount);
        $remainingBalance = max(0, $creditAmount - $paidAmount);

        if (! $existing && $remainingBalance <= 0) {
            $this->syncCustomerBalance($sale->customer);

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

        $this->syncCustomerBalance($sale->customer);

        return $credit->refresh();
    }

    public function markOverdue(CustomerCredit $credit): CustomerCredit
    {
        if ((float) $credit->remaining_balance <= 0) {
            return $credit;
        }

        $credit->forceFill(['status' => PaymentStatus::Overdue])->save();

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

    public function syncCustomerBalance(Customer $customer): Customer
    {
        $balance = CustomerCredit::query()
            ->where('customer_id', $customer->id)
            ->where('remaining_balance', '>', 0)
            ->sum('remaining_balance');

        $customer->forceFill(['current_balance' => $balance])->save();
        $this->creditScoringService->syncProfile($customer);

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
