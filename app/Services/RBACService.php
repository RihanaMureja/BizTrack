<?php

namespace App\Services;

use App\Enums\Role;
use App\Models\User;

class RBACService
{
    /**
     * @return list<array{title: string, href: string, icon: string}>
     */
    public function navigationFor(User $user): array
    {
        $base = [
            ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutGrid'],
        ];

        return match ($user->role) {
            Role::SuperAdmin => [
                ['title' => 'Dashboard', 'href' => '/admin', 'icon' => 'LayoutGrid'],
                ['title' => 'Businesses', 'href' => '/admin/businesses', 'icon' => 'Building2'],
                ['title' => 'Users', 'href' => '/admin/users', 'icon' => 'Users'],
                ['title' => 'Subscriptions', 'href' => '/admin/subscriptions', 'icon' => 'CreditCard'],
                ['title' => 'Roles', 'href' => '/admin/roles', 'icon' => 'ShieldCheck'],
                ['title' => 'Permissions', 'href' => '/admin/permissions', 'icon' => 'KeyRound'],
                ['title' => 'Audit Logs', 'href' => '/admin/audit-logs', 'icon' => 'ScrollText'],
                ['title' => 'Settings', 'href' => '/settings/profile', 'icon' => 'Settings'],
            ],
            Role::Owner => [
                ...$base,
                ['title' => 'Business Profile', 'href' => '/business/profile', 'icon' => 'Building2'],
                ['title' => 'Products', 'href' => '/products', 'icon' => 'Package'],
                ['title' => 'Categories', 'href' => '/categories', 'icon' => 'Tags'],
                ['title' => 'Inventory', 'href' => '/inventory', 'icon' => 'Boxes'],
                ['title' => 'Customers', 'href' => '/customers', 'icon' => 'Users'],
                ['title' => 'Cashiers', 'href' => '/cashiers', 'icon' => 'UserRound'],
                ['title' => 'Sales', 'href' => '/sales', 'icon' => 'Receipt'],
                ['title' => 'Payments', 'href' => '/payments', 'icon' => 'CreditCard'],
                ['title' => 'Expenses', 'href' => '/expenses', 'icon' => 'WalletCards'],
                ['title' => 'Reports', 'href' => '/reports', 'icon' => 'ChartNoAxesCombined'],
                ['title' => 'Notifications', 'href' => '/notifications', 'icon' => 'Bell'],
                ['title' => 'Audit Logs', 'href' => '/admin/audit-logs', 'icon' => 'ScrollText'],
                ['title' => 'Settings', 'href' => '/settings/profile', 'icon' => 'Settings'],
            ],
            Role::Cashier => [
                ...$base,
                ['title' => 'Sales', 'href' => '/sales', 'icon' => 'Receipt'],
                ['title' => 'Customers', 'href' => '/customers', 'icon' => 'Users'],
                ['title' => 'Payments', 'href' => '/payments', 'icon' => 'CreditCard'],
                ['title' => 'Notifications', 'href' => '/notifications', 'icon' => 'Bell'],
                ['title' => 'Profile', 'href' => '/settings/profile', 'icon' => 'UserRound'],
            ],
        };
    }
}
