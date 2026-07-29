<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner();
    }

    public function create(User $user): bool
    {
        return $user->isOwner() && $user->ownedBusiness()->exists();
    }

    public function view(User $user, Report $report): bool
    {
        return $user->isOwner() && $report->business_id === $user->ownedBusiness?->id;
    }
}
