<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Models\User;
use App\Services\PlatformNotificationService;
use Illuminate\Auth\Events\Verified;

class NotifySuperAdminsOfEmailVerification
{
    public function __construct(private readonly PlatformNotificationService $platformNotifications) {}

    public function handle(Verified $event): void
    {
        if (! $event->user instanceof User || $event->user->isSuperAdmin()) {
            return;
        }

        $this->platformNotifications->notifySuperAdmins(
            NotificationType::PlatformEmailVerified,
            'Email verified',
            $event->user->name.' verified '.$event->user->email.'.',
            $event->user->ownedBusiness,
            $event->user,
            NotificationCategory::Security,
            NotificationPriority::Normal,
            route('admin.users.index', ['search' => $event->user->email], false),
            'email-verified:'.$event->user->id,
        );
    }
}
