<?php

namespace App\Traits;

use App\Enums\Role;

trait HasRoles
{
    public function hasRole(Role|string $role): bool
    {
        $roleValue = $role instanceof Role ? $role->value : $role;

        return $this->role->value === $roleValue;
    }

    public function hasAnyRole(Role|string ...$roles): bool
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }

        return false;
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(Role::SuperAdmin);
    }

    public function isOwner(): bool
    {
        return $this->hasRole(Role::Owner);
    }

    public function isCashier(): bool
    {
        return $this->hasRole(Role::Cashier);
    }
}
