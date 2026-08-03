<?php

namespace App\Policies;

use App\Enums\BusinessPermissionKey;
use App\Models\User;

class CashierPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageEmployees);
    }

    public function view(User $user, User $cashier): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageEmployees)
            && $cashier->isCashier()
            && $cashier->business_id === ($user->ownedBusiness?->id ?? $user->business_id);
    }

    public function create(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageEmployees)
            && ($user->ownedBusiness?->id ?? $user->business_id) !== null;
    }

    public function update(User $user, User $cashier): bool
    {
        return $this->view($user, $cashier);
    }

    public function delete(User $user, User $cashier): bool
    {
        return $this->view($user, $cashier);
    }
}
