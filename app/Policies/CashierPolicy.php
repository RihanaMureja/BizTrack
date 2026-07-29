<?php

namespace App\Policies;

use App\Models\User;

class CashierPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner();
    }

    public function view(User $user, User $cashier): bool
    {
        return $user->isOwner()
            && $cashier->isCashier()
            && $cashier->business_id === $user->ownedBusiness?->id;
    }

    public function create(User $user): bool
    {
        return $user->isOwner() && $user->ownedBusiness()->exists();
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
