<?php

namespace App\Policies;

use App\Enums\BusinessPermissionKey;
use App\Models\BusinessRole;
use App\Models\User;

class BusinessRolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageEmployees);
    }

    public function create(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageEmployees)
            && ($user->ownedBusiness?->id ?? $user->business_id) !== null;
    }

    public function update(User $user, BusinessRole $role): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageEmployees)
            && $role->business_id === ($user->ownedBusiness?->id ?? $user->business_id);
    }

    public function delete(User $user, BusinessRole $role): bool
    {
        return $this->update($user, $role) && ! $role->is_default && $role->users()->doesntExist();
    }
}
