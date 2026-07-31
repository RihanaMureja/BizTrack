<?php

namespace App\Policies;

use App\Models\BusinessRole;
use App\Models\User;

class BusinessRolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner();
    }

    public function create(User $user): bool
    {
        return $user->isOwner() && $user->ownedBusiness()->exists();
    }

    public function update(User $user, BusinessRole $role): bool
    {
        return $user->isOwner() && $role->business_id === $user->ownedBusiness?->id;
    }

    public function delete(User $user, BusinessRole $role): bool
    {
        return $this->update($user, $role) && ! $role->is_default && $role->users()->doesntExist();
    }
}
