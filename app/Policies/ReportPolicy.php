<?php

namespace App\Policies;

use App\Enums\BusinessPermissionKey;
use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ViewReports);
    }

    public function create(User $user): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ViewReports)
            && ($user->ownedBusiness?->id ?? $user->business_id) !== null;
    }

    public function view(User $user, Report $report): bool
    {
        return $user->hasBusinessPermission(BusinessPermissionKey::ViewReports)
            && $report->business_id === ($user->ownedBusiness?->id ?? $user->business_id);
    }
}
