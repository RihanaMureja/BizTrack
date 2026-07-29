<?php

namespace App\Policies;

use App\Models\Sale;
use App\Models\User;

class SalePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner() || $user->isCashier();
    }

    public function view(User $user, Sale $sale): bool
    {
        return $sale->business_id === ($user->ownedBusiness?->id ?? $user->business_id);
    }

    public function create(User $user): bool
    {
        return ($user->isOwner() && $user->ownedBusiness()->exists()) || ($user->isCashier() && $user->business_id !== null);
    }
}
