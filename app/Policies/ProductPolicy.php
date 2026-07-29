<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner();
    }

    public function view(User $user, Product $product): bool
    {
        return $product->business_id === $user->business_id
            || $product->business_id === $user->ownedBusiness?->id;
    }

    public function create(User $user): bool
    {
        return $user->isOwner() && $user->ownedBusiness()->exists();
    }

    public function update(User $user, Product $product): bool
    {
        return $user->isOwner() && $product->business_id === $user->ownedBusiness?->id;
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }
}
