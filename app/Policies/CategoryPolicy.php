<?php

namespace App\Policies;

use App\Enums\BusinessPermissionKey;
use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageCategories);
    }

    public function view(User $user, Category $category): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageCategories)
            && $category->business_id === ($user->ownedBusiness?->id ?? $user->business_id);
    }

    public function create(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageCategories)
            && ($user->ownedBusiness?->id ?? $user->business_id) !== null;
    }

    public function update(User $user, Category $category): bool
    {
        return $this->view($user, $category);
    }

    public function delete(User $user, Category $category): bool
    {
        return $this->update($user, $category);
    }
}
