<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\User;

class AuditLogPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [Role::SuperAdmin, Role::Owner], true);
    }

    public function view(User $user, AuditLog $auditLog): bool
    {
        if ($user->role === Role::SuperAdmin) {
            return true;
        }

        $businessId = $user->ownedBusiness?->id ?? $user->business_id;

        return $user->role === Role::Owner && $businessId && $auditLog->business_id === $businessId;
    }
}
