<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Events\BusinessSubscriptionChanged;
use App\Services\PlatformNotificationService;

class NotifySuperAdminsOfSubscriptionChanged
{
    public function __construct(private readonly PlatformNotificationService $platformNotifications) {}

    public function handle(BusinessSubscriptionChanged $event): void
    {
        $business = $event->business->loadMissing('subscription');
        $planName = $event->subscription->name;
        $action = $event->previousSubscriptionId ? 'changed to' : 'activated';

        $this->platformNotifications->notifySuperAdmins(
            NotificationType::PlatformSubscriptionChanged,
            'Subscription '.$action,
            $business->business_name.' '.$action.' the '.$planName.' plan.',
            $business,
            $business->owner,
            NotificationCategory::Subscription,
            NotificationPriority::High,
            route('admin.subscriptions.assignments.index', ['search' => $business->business_name], false),
            'subscription-changed:'.$business->id.':'.$event->subscription->id,
        );
    }
}
