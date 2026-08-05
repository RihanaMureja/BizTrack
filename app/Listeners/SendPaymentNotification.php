<?php

namespace App\Listeners;

use App\Events\PaymentCompleted;
use App\Enums\NotificationType;
use App\Notifications\PaymentReceivedNotification;
use App\Services\AuditLogService;
use App\Services\NotificationService;

class SendPaymentNotification
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
        private readonly NotificationService $notificationService,
    ) {}

    public function handle(PaymentCompleted $event): void
    {
        $payment = $event->payment->loadMissing(['business.owner', 'sale', 'user']);
        $business = $payment->business;
        $owner = $business->owner;

        $this->notificationService->create(
            $business,
            $owner,
            NotificationType::PaymentReceived,
            'Payment received: '.$payment->payment_number,
            $payment->amount.' ETB received for '.$payment->sale->invoice_number.'.',
        );

        $this->auditLogService->record(
            'payment_completed',
            'payments',
            $payment->id,
            null,
            $payment->only(['payment_number', 'sale_id', 'method', 'status', 'amount', 'reference']),
            $payment->user,
        );

        $owner?->notify(new PaymentReceivedNotification($payment));
    }
}
