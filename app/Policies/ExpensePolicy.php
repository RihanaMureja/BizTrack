<?php

namespace App\Policies;

use App\Enums\BusinessPermissionKey;
use App\Models\Expense;
use App\Models\User;

class ExpensePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageExpenses);
    }

    public function create(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageExpenses)
            && ($user->ownedBusiness?->id ?? $user->business_id) !== null;
    }

    public function update(User $user, Expense $expense): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ManageExpenses)
            && $expense->business_id === ($user->ownedBusiness?->id ?? $user->business_id);
    }

    public function delete(User $user, Expense $expense): bool
    {
        return $this->update($user, $expense);
    }
}
