<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;

class ExpensePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner();
    }

    public function create(User $user): bool
    {
        return $user->isOwner() && $user->ownedBusiness()->exists();
    }

    public function update(User $user, Expense $expense): bool
    {
        return $user->isOwner() && $expense->business_id === $user->ownedBusiness?->id;
    }

    public function delete(User $user, Expense $expense): bool
    {
        return $this->update($user, $expense);
    }
}
