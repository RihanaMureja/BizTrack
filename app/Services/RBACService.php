<?php

namespace App\Services;

use App\Enums\Role;
use App\Enums\BusinessPermissionKey;
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
                ['title' => 'Roles & Permissions', 'href' => '/admin/roles', 'icon' => 'ShieldCheck'],
                ['title' => 'Audit Logs', 'href' => '/admin/audit-logs', 'icon' => 'ScrollText'],
                ['title' => 'Settings', 'href' => '/settings/profile', 'icon' => 'Settings'],
            ],
            Role::Owner => [
                ...$base,
                ['title' => 'Business Profile', 'href' => '/business/profile', 'icon' => 'Building2'],
                ['title' => 'Products', 'href' => '/products', 'icon' => 'Package'],
                ['title' => 'Product Insights', 'href' => '/products/insights', 'icon' => 'ChartColumnIncreasing'],
                ['title' => 'Categories', 'href' => '/categories', 'icon' => 'Tags'],
                ['title' => 'Inventory', 'href' => '/inventory', 'icon' => 'Boxes'],
                ['title' => 'Customers', 'href' => '/customers', 'icon' => 'Users'],
                ['title' => 'Employees', 'href' => '/cashiers', 'icon' => 'UserRound'],
                ['title' => 'Employee Roles', 'href' => '/business-roles', 'icon' => 'ShieldCheck'],
                ['title' => 'Sales', 'href' => '/sales', 'icon' => 'Receipt'],
                ['title' => 'Payments', 'href' => '/payments', 'icon' => 'CreditCard'],
                ['title' => 'Expenses', 'href' => '/expenses', 'icon' => 'WalletCards'],
                ['title' => 'Reports', 'href' => '/reports', 'icon' => 'ChartNoAxesCombined'],
                ['title' => 'Notifications', 'href' => '/notifications', 'icon' => 'Bell'],
                ['title' => 'Audit Logs', 'href' => '/admin/audit-logs', 'icon' => 'ScrollText'],
                ['title' => 'Settings', 'href' => '/settings/profile', 'icon' => 'Settings'],
            ],
            Role::Cashier => $this->employeeNavigation($user, $base),
        };
    }

    /**
     * @param  list<array{title: string, href: string, icon: string}>  $base
     * @return list<array{title: string, href: string, icon: string}>
     */
    private function employeeNavigation(User $user, array $base): array
    {
        $items = $user->hasBusinessPermission(BusinessPermissionKey::ViewDashboard) ? $base : [];

        foreach ([
            BusinessPermissionKey::ManageProducts->value => ['title' => 'Products', 'href' => '/products', 'icon' => 'Package'],
            BusinessPermissionKey::ManageCategories->value => ['title' => 'Categories', 'href' => '/categories', 'icon' => 'Tags'],
            BusinessPermissionKey::ManageInventory->value => ['title' => 'Inventory', 'href' => '/inventory', 'icon' => 'Boxes'],
            BusinessPermissionKey::ManageCustomers->value => ['title' => 'Customers', 'href' => '/customers', 'icon' => 'Users'],
            BusinessPermissionKey::ManageEmployees->value => ['title' => 'Employees', 'href' => '/cashiers', 'icon' => 'UserRound'],
            BusinessPermissionKey::ViewSales->value => ['title' => 'Sales', 'href' => '/sales', 'icon' => 'Receipt'],
            BusinessPermissionKey::ManagePayments->value => ['title' => 'Payments', 'href' => '/payments', 'icon' => 'CreditCard'],
            BusinessPermissionKey::ManageExpenses->value => ['title' => 'Expenses', 'href' => '/expenses', 'icon' => 'WalletCards'],
            BusinessPermissionKey::ViewReports->value => ['title' => 'Reports', 'href' => '/reports', 'icon' => 'ChartNoAxesCombined'],
            BusinessPermissionKey::ViewNotifications->value => ['title' => 'Notifications', 'href' => '/notifications', 'icon' => 'Bell'],
        ] as $permission => $item) {
            if ($user->hasBusinessPermission($permission)) {
                $items[] = $item;
            }
        }

        $items[] = ['title' => 'Profile', 'href' => '/settings/profile', 'icon' => 'UserRound'];

        return $items;
    }
}
