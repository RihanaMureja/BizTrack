<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner() || $user->isCashier();
    }

    public function view(User $user, Payment $payment): bool
    {
        return $payment->business_id === ($user->ownedBusiness?->id ?? $user->business_id);
    }

    public function create(User $user): bool
    {
        return ($user->isOwner() && $user->ownedBusiness()->exists())
            || ($user->isCashier() && $user->business_id !== null);
    }

    public function update(User $user, Payment $payment): bool
    {
        return $this->view($user, $payment);
    }
}
