<?php

namespace App\Policies;

use App\Enums\BusinessPermissionKey;
use App\Models\Inventory;
use App\Models\User;

class InventoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageInventory);
    }

    public function view(User $user, Inventory $inventory): bool
    {
        $businessId = $user->ownedBusiness?->id ?? $user->business_id;

        return $user->hasBusinessPermission(BusinessPermissionKey::ManageInventory)
            && $inventory->product?->business_id === $businessId;
    }

    public function update(User $user, Inventory $inventory): bool
    {
        return $this->view($user, $inventory);
    }
}
