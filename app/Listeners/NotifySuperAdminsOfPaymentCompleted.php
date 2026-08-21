<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Events\PaymentCompleted;
use App\Services\PlatformNotificationService;

class NotifySuperAdminsOfPaymentCompleted
{
    public function __construct(private readonly PlatformNotificationService $platformNotifications) {}

    public function handle(PaymentCompleted $event): void
    {
        $payment = $event->payment->loadMissing('business', 'sale');
        $method = $payment->method?->label() ?? 'payment';
        $amount = number_format((float) $payment->amount, 2);

        $this->platformNotifications->notifySuperAdmins(
            NotificationType::PlatformPaymentCompleted,
            'Payment completed',
            ($payment->business?->business_name ?? 'A business').' recorded '.$amount.' ETB via '.$method.'.',
            $payment->business,
            $payment->user,
            NotificationCategory::Payment,
            NotificationPriority::Normal,
            route('admin.reports.revenue', [], false),
            'payment-completed:'.$payment->id,
        );
    }
}
