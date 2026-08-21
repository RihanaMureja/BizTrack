<?php

namespace App\Listeners;

use App\Enums\BusinessAccessMode;
use App\Enums\NotificationType;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Events\BusinessOnboardingCompleted;
use App\Services\PlatformNotificationService;

class NotifySuperAdminsOfBusinessOnboardingCompleted
{
    public function __construct(private readonly PlatformNotificationService $platformNotifications) {}

    public function handle(BusinessOnboardingCompleted $event): void
    {
        $business = $event->business->loadMissing('owner', 'subscription');
        $mode = $event->accessMode === BusinessAccessMode::Trial ? 'started a free trial' : 'activated paid access';

        $this->platformNotifications->notifySuperAdmins(
            NotificationType::PlatformOnboardingCompleted,
            'Onboarding completed',
            $business->business_name.' '.$mode.'.',
            $business,
            $business->owner,
            $event->accessMode === BusinessAccessMode::Trial ? NotificationCategory::Business : NotificationCategory::Subscription,
            $event->accessMode === BusinessAccessMode::Trial ? NotificationPriority::Normal : NotificationPriority::High,
            $event->accessMode === BusinessAccessMode::Trial
                ? route('admin.businesses.index', ['search' => $business->business_name], false)
                : route('admin.subscriptions.assignments.index', ['search' => $business->business_name], false),
            'onboarding-completed:'.$business->id.':'.$event->accessMode->value,
        );
    }
}
