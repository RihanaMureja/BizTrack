<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(Role::SuperAdmin, Role::Owner);
    }

    public function view(User $user, User $target): bool
    {
        return $user->isSuperAdmin()
            || $user->id === $target->id
            || ($user->isOwner() && $target->isCashier() && $target->business_id === $user->ownedBusiness?->id);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(Role::SuperAdmin, Role::Owner);
    }

    public function update(User $user, User $target): bool
    {
        return $user->id === $target->id
            || $user->isSuperAdmin()
            || ($user->isOwner() && $target->isCashier() && $target->business_id === $user->ownedBusiness?->id);
    }

    public function delete(User $user, User $target): bool
    {
        return ($user->isSuperAdmin() && $user->id !== $target->id)
            || ($user->isOwner() && $target->isCashier() && $target->business_id === $user->ownedBusiness?->id);
    }
}
