<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Events\BusinessRegistered;
use App\Services\PlatformNotificationService;

class NotifySuperAdminsOfBusinessRegistered
{
    public function __construct(private readonly PlatformNotificationService $platformNotifications) {}

    public function handle(BusinessRegistered $event): void
    {
        $business = $event->business->loadMissing('owner');

        $this->platformNotifications->notifySuperAdmins(
            NotificationType::PlatformBusinessProfileCreated,
            'Business profile created',
            $business->business_name.' submitted its initial business profile.',
            $business,
            $business->owner,
            NotificationCategory::Business,
            NotificationPriority::High,
            route('admin.businesses.index', ['search' => $business->business_name], false),
            'business-profile-created:'.$business->id,
        );
    }
}
