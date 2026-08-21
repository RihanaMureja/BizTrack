<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Models\User;
use App\Services\PlatformNotificationService;
use Illuminate\Auth\Events\Registered;

class NotifySuperAdminsOfUserSignup
{
    public function __construct(private readonly PlatformNotificationService $platformNotifications) {}

    public function handle(Registered $event): void
    {
        if (! $event->user instanceof User || $event->user->isSuperAdmin()) {
            return;
        }

        $this->platformNotifications->notifySuperAdmins(
            NotificationType::PlatformUserSignup,
            'New account signup',
            $event->user->name.' created a BizTrack account and is waiting to verify email.',
            $event->user->ownedBusiness,
            $event->user,
            NotificationCategory::Business,
            NotificationPriority::Normal,
            route('admin.users.index', ['search' => $event->user->email], false),
            'user-signup:'.$event->user->id,
        );
    }
}
