<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        // Cashiers browse categories indirectly (product search) once that
        // module ships; the /categories management screen stays owner-only.
        return $user->isOwner();
    }

    public function view(User $user, Category $category): bool
    {
        return $category->business_id === $user->business_id
            || $category->business_id === $user->ownedBusiness?->id;
    }

    public function create(User $user): bool
    {
        return $user->isOwner() && $user->ownedBusiness()->exists();
    }

    public function update(User $user, Category $category): bool
    {
        return $user->isOwner() && $category->business_id === $user->ownedBusiness?->id;
    }

    public function delete(User $user, Category $category): bool
    {
        return $this->update($user, $category);
    }
}
