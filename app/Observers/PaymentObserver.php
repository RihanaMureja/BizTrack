<?php

namespace App\Observers;

use App\Models\Payment;
use App\Services\AuditLogService;

class PaymentObserver
{
    public function creating(Payment $payment): void
    {
        if (! $payment->paid_at && $payment->status->value === 'completed') {
            $payment->paid_at = now();
        }
    }

    public function created(Payment $payment): void
    {
        app(AuditLogService::class)->log(
            action: 'payment.created',
            auditable: $payment,
            user: $payment->user,
            newValues: $payment->only(['payment_number', 'sale_id', 'method', 'status', 'amount', 'reference']),
        );
    }

    public function updated(Payment $payment): void
    {
        $changes = collect($payment->getChanges())->except(['updated_at'])->keys();

        if ($changes->isEmpty()) {
            return;
        }

        app(AuditLogService::class)->log(
            action: 'payment.updated',
            auditable: $payment,
            user: $payment->user,
            oldValues: $changes->mapWithKeys(fn (string $key): array => [$key => $payment->getOriginal($key)])->all(),
            newValues: $changes->mapWithKeys(fn (string $key): array => [$key => $payment->{$key}])->all(),
        );
    }
}
