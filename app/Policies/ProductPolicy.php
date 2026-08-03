<?php

namespace App\Policies;

use App\Enums\BusinessPermissionKey;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageProducts);
    }

    public function view(User $user, Product $product): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageProducts)
            && $product->business_id === ($user->ownedBusiness?->id ?? $user->business_id);
    }

    public function create(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageProducts)
            && ($user->ownedBusiness?->id ?? $user->business_id) !== null;
    }

    public function update(User $user, Product $product): bool
    {
        return $this->view($user, $product);
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }
}
