<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner() || $user->isCashier();
    }

    public function view(User $user, Customer $customer): bool
    {
        return $customer->business_id === ($user->ownedBusiness?->id ?? $user->business_id);
    }

    public function create(User $user): bool
    {
        return ($user->isOwner() && $user->ownedBusiness()->exists())
            || ($user->isCashier() && $user->business_id !== null);
    }

    public function update(User $user, Customer $customer): bool
    {
        return ($user->isOwner() || $user->isCashier()) && $this->view($user, $customer);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $this->update($user, $customer);
    }
}
