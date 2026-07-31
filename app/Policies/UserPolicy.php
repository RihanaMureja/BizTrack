<?php

namespace App\Policies;

use App\Enums\BusinessPermissionKey;
use App\Enums\Role;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(Role::SuperAdmin, Role::Owner)
            || $user->hasBusinessPermission(BusinessPermissionKey::ManageEmployees);
    }

    public function view(User $user, User $target): bool
    {
        return $user->isSuperAdmin()
            || $user->id === $target->id
            || $this->canManageBusinessEmployee($user, $target);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(Role::SuperAdmin, Role::Owner)
            || $user->hasBusinessPermission(BusinessPermissionKey::ManageEmployees);
    }

    public function update(User $user, User $target): bool
    {
        return $user->id === $target->id
            || $user->isSuperAdmin()
            || $this->canManageBusinessEmployee($user, $target);
    }

    public function delete(User $user, User $target): bool
    {
        return ($user->isSuperAdmin() && $user->id !== $target->id)
            || $this->canManageBusinessEmployee($user, $target);
    }

    private function canManageBusinessEmployee(User $user, User $target): bool
    {
        if (! $target->isCashier()) {
            return false;
        }

        return ($user->isOwner() && $target->business_id === $user->ownedBusiness?->id)
            || ($user->hasBusinessPermission(BusinessPermissionKey::ManageEmployees) && $target->business_id === $user->business_id);
    }
}
