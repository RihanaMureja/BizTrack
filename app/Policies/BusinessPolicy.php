<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\User;

class BusinessPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, Business $business): bool
    {
        return $user->isSuperAdmin() || $business->owner_id === $user->id || $business->id === $user->business_id;
    }

    public function create(User $user): bool
    {
        return $user->isOwner() && $user->ownedBusiness()->doesntExist();
    }

    public function update(User $user, Business $business): bool
    {
        return $user->isSuperAdmin() || ($user->isOwner() && $business->owner_id === $user->id);
    }

    public function updateStatus(User $user): bool
    {
        return $user->isSuperAdmin();
    }
}
