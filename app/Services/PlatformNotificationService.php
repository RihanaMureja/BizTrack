<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\User;

class PlatformNotificationService
{
    public function __construct(private readonly NotificationService $notifications) {}

    public function notifySuperAdmins(
        NotificationType $type,
        string $title,
        string $message,
        ?Business $business = null,
        ?User $relatedUser = null,
        ?NotificationCategory $category = null,
        NotificationPriority $priority = NotificationPriority::Normal,
        ?string $actionUrl = null,
        ?string $dedupeKey = null,
    ): void {
        User::query()
            ->where('role', Role::SuperAdmin->value)
            ->where('status', RecordStatus::Active->value)
            ->each(fn (User $admin) => $this->notifications->create(
                $business,
                $admin,
                $type,
                $title,
                $message,
                [
                    'related_user_id' => $relatedUser?->id,
                    'category' => $category,
                    'priority' => $priority,
                    'action_url' => $actionUrl,
                    'dedupe_key' => $dedupeKey ? 'platform:'.$dedupeKey : null,
                ],
            ));
    }
}
