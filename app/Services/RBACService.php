<?php

namespace App\Services;

use App\Enums\Role;
use App\Enums\BusinessPermissionKey;
use App\Models\User;

class RBACService
{
    /**
     * @return list<array{label: string, items: list<array{title: string, href: string, icon: string}>}>
     */
    public function navigationFor(User $user): array
    {
        return match ($user->role) {
            Role::SuperAdmin => [
                $this->group('Workspace', [
                    ['title' => 'Dashboard', 'href' => '/admin', 'icon' => 'LayoutGrid'],
                ]),
                $this->group('Platform', [
                    ['title' => 'Businesses', 'href' => '/admin/businesses', 'icon' => 'Building2'],
                    ['title' => 'Users', 'href' => '/admin/users', 'icon' => 'Users'],
                    ['title' => 'Subscriptions', 'href' => '/admin/subscriptions', 'icon' => 'CreditCard'],
                ]),
                $this->group('Governance', [
                    ['title' => 'Roles & Permissions', 'href' => '/admin/roles', 'icon' => 'ShieldCheck'],
                    ['title' => 'Audit Logs', 'href' => '/admin/audit-logs', 'icon' => 'ScrollText'],
                ]),
            ],
            Role::Owner => [
                $this->group('Workspace', [
                    ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutGrid'],
                ]),
                $this->group('Catalog', [
                    ['title' => 'Categories', 'href' => '/categories', 'icon' => 'Tags'],
                    ['title' => 'Products', 'href' => '/products', 'icon' => 'Package'],
                    ['title' => 'Inventory', 'href' => '/inventory', 'icon' => 'Boxes'],
                ]),
                $this->group('Operations', [
                    ['title' => 'Sales', 'href' => '/sales', 'icon' => 'Receipt'],
                    ['title' => 'Payments', 'href' => '/payments', 'icon' => 'CreditCard'],
                    ['title' => 'Customers', 'href' => '/customers', 'icon' => 'Users'],
                    ['title' => 'Credit & Discounts', 'href' => '/credit-discounts', 'icon' => 'BadgePercent'],
                    ['title' => 'Expenses', 'href' => '/expenses', 'icon' => 'WalletCards'],
                    ['title' => 'Reports', 'href' => '/reports', 'icon' => 'ChartNoAxesCombined'],
                ]),
                $this->group('Team', [
                    ['title' => 'Employees', 'href' => '/cashiers', 'icon' => 'UserRound'],
                    ['title' => 'Employee Roles', 'href' => '/business-roles', 'icon' => 'ShieldCheck'],
                ]),
                $this->group('Governance', [
                    ['title' => 'Audit Logs', 'href' => '/admin/audit-logs', 'icon' => 'ScrollText'],
                ]),
            ],
            Role::Cashier => $this->employeeNavigation($user),
        };
    }

    /**
     * @return list<array{label: string, items: list<array{title: string, href: string, icon: string}>}>
     */
    private function employeeNavigation(User $user): array
    {
        $groups = [];

        if ($user->hasBusinessPermission(BusinessPermissionKey::ViewDashboard)) {
            $groups[] = $this->group('Workspace', [
                ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutGrid'],
            ]);
        }

        $groups[] = $this->group('Catalog', $this->permittedItems($user, [
            BusinessPermissionKey::ManageCategories->value => ['title' => 'Categories', 'href' => '/categories', 'icon' => 'Tags'],
            BusinessPermissionKey::ManageProducts->value => ['title' => 'Products', 'href' => '/products', 'icon' => 'Package'],
            BusinessPermissionKey::ManageInventory->value => ['title' => 'Inventory', 'href' => '/inventory', 'icon' => 'Boxes'],
        ]));

        $groups[] = $this->group('Operations', $this->permittedItems($user, [
            BusinessPermissionKey::CreateSales->value => ['title' => 'Sales', 'href' => '/sales', 'icon' => 'Receipt'],
            BusinessPermissionKey::ViewSales->value => ['title' => 'Sales', 'href' => '/sales', 'icon' => 'Receipt'],
            BusinessPermissionKey::ManagePayments->value => ['title' => 'Payments', 'href' => '/payments', 'icon' => 'CreditCard'],
            BusinessPermissionKey::ManageCustomers->value => ['title' => 'Customers', 'href' => '/customers', 'icon' => 'Users'],
            BusinessPermissionKey::ManageExpenses->value => ['title' => 'Expenses', 'href' => '/expenses', 'icon' => 'WalletCards'],
            BusinessPermissionKey::ViewReports->value => ['title' => 'Reports', 'href' => '/reports', 'icon' => 'ChartNoAxesCombined'],
        ]));

        $groups[] = $this->group('Team', $this->permittedItems($user, [
            BusinessPermissionKey::ManageEmployees->value => ['title' => 'Employees', 'href' => '/cashiers', 'icon' => 'UserRound'],
            BusinessPermissionKey::ManageEmployees->value.'.roles' => ['title' => 'Employee Roles', 'href' => '/business-roles', 'icon' => 'ShieldCheck'],
        ]));

        return array_values(array_filter($groups, fn (array $group): bool => count($group['items']) > 0));
    }

    /**
     * @param  array<string, array{title: string, href: string, icon: string}>  $items
     * @return list<array{title: string, href: string, icon: string}>
     */
    private function permittedItems(User $user, array $items): array
    {
        $permitted = [];

        foreach ($items as $permission => $item) {
            $permissionKey = str($permission)->before('.')->toString();

            if ($user->hasBusinessPermission($permissionKey) && ! collect($permitted)->contains('href', $item['href'])) {
                $permitted[] = $item;
            }
        }

        return $permitted;
    }

    /**
     * @param  list<array{title: string, href: string, icon: string}>  $items
     * @return array{label: string, items: list<array{title: string, href: string, icon: string}>}
     */
    private function group(string $label, array $items): array
    {
        return [
            'label' => $label,
            'items' => $items,
        ];
    }
}
