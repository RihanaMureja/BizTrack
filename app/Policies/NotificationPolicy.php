<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

class NotificationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner() || $user->isCashier() || $user->isSuperAdmin();
    }

    public function update(User $user, Notification $notification): bool
    {
        $businessId = $user->ownedBusiness?->id ?? $user->business_id;

        return $notification->user_id === $user->id
            || ($businessId !== null && $notification->business_id === $businessId);
    }
}
