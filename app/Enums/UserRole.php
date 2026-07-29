<?php

namespace App\Enums;

/**
 * @deprecated Use App\Enums\Role.
 */
enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Owner = 'owner';
    case Cashier = 'cashier';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Owner => 'Business Owner',
            self::Cashier => 'Cashier',
        };
    }
}
