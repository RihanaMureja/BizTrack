<?php

namespace App\Policies;

use App\Models\Inventory;
use App\Models\User;

class InventoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner();
    }

    public function view(User $user, Inventory $inventory): bool
    {
        return $inventory->product?->business_id === $user->ownedBusiness?->id;
    }

    public function update(User $user, Inventory $inventory): bool
    {
        return $user->isOwner() && $this->view($user, $inventory);
    }
}
