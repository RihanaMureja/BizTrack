<?php

namespace App\Policies;

use App\Models\ServiceFee;
use App\Models\User;

class ServiceFeePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner() || $user->isSuperAdmin();
    }

    public function view(User $user, ServiceFee $serviceFee): bool
    {
        return $user->isSuperAdmin()
            || ($user->isOwner() && $serviceFee->business_id === $user->ownedBusiness?->id);
    }

    public function pay(User $user, ServiceFee $serviceFee): bool
    {
        return $user->isOwner() && $serviceFee->business_id === $user->ownedBusiness?->id;
    }

    public function updateSetting(User $user): bool
    {
        return $user->isSuperAdmin();
    }
}
