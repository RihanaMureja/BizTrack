<?php

namespace App\Services;

use App\Enums\BusinessPermissionKey;
use App\Enums\Role;
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
                [
                    'label' => 'Workspace',
                    'items' => [
                        ['title' => 'Dashboard', 'href' => '/admin', 'icon' => 'LayoutGrid'],
                    ],
                ],
                [
                    'label' => 'Management',
                    'items' => [
                        ['title' => 'Businesses', 'href' => '/admin/businesses', 'icon' => 'Building2'],
                        ['title' => 'Users', 'href' => '/admin/users', 'icon' => 'Users'],
                        ['title' => 'Subscriptions', 'href' => '/admin/subscriptions', 'icon' => 'CreditCard'],
                        ['title' => 'Roles & Permissions', 'href' => '/admin/roles', 'icon' => 'ShieldCheck'],
                        ['title' => 'Audit Logs', 'href' => '/admin/audit-logs', 'icon' => 'ScrollText'],
                    ],
                ],
                [
                    'label' => 'Settings',
                    'items' => [
                        ['title' => 'Settings', 'href' => '/settings/profile', 'icon' => 'Settings'],
                    ],
                ],
            ],

            Role::Owner => [
                [
                    'label' => 'Workspace',
                    'items' => [
                        ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutGrid'],
                    ],
                ],
                [
                    'label' => 'Catalog',
                    'items' => [
                        ['title' => 'Categories', 'href' => '/categories', 'icon' => 'Tags'],
                        ['title' => 'Products', 'href' => '/products', 'icon' => 'Package'],
                        ['title' => 'Product Insights', 'href' => '/products/insights', 'icon' => 'ChartColumnIncreasing'],
                        ['title' => 'Inventory', 'href' => '/inventory', 'icon' => 'Boxes'],
                    ],
                ],
                [
                    'label' => 'Operations',
                    'items' => [
                        ['title' => 'Sales', 'href' => '/sales', 'icon' => 'Receipt'],
                        ['title' => 'Customers', 'href' => '/customers', 'icon' => 'Users'],
                        ['title' => 'Payments', 'href' => '/payments', 'icon' => 'CreditCard'],
                        ['title' => 'Expenses', 'href' => '/expenses', 'icon' => 'WalletCards'],
                        ['title' => 'Reports', 'href' => '/reports', 'icon' => 'ChartNoAxesCombined'],
                    ],
                ],
                [
                    'label' => 'Team',
                    'items' => [
                        ['title' => 'Employees', 'href' => '/cashiers', 'icon' => 'UserRound'],
                        ['title' => 'Employee Roles', 'href' => '/business-roles', 'icon' => 'ShieldCheck'],
                    ],
                ],
                [
                    'label' => 'Settings',
                    'items' => [
                        ['title' => 'Business Profile', 'href' => '/business/profile', 'icon' => 'Building2'],
                        ['title' => 'Notifications', 'href' => '/notifications', 'icon' => 'Bell'],
                        ['title' => 'Settings', 'href' => '/settings/profile', 'icon' => 'Settings'],
                    ],
                ],
            ],

            Role::Cashier => $this->employeeNavigation($user),
        };
    }

    /**
     * @return list<array{label: string, items: list<array{title: string, href: string, icon: string}>}>
     */
    private function employeeNavigation(User $user): array
    {
        $groups = [
            'Workspace' => [],
            'Catalog' => [],
            'Operations' => [],
            'Team' => [],
            'Settings' => [],
        ];

        if ($user->hasBusinessPermission(BusinessPermissionKey::ViewDashboard)) {
            $groups['Workspace'][] = [
                'title' => 'Dashboard',
                'href' => '/dashboard',
                'icon' => 'LayoutGrid',
            ];
        }

        foreach ([
            BusinessPermissionKey::ManageCategories->value => [
                'group' => 'Catalog',
                'item' => [
                    'title' => 'Categories',
                    'href' => '/categories',
                    'icon' => 'Tags',
                ],
            ],
            BusinessPermissionKey::ManageProducts->value => [
                'group' => 'Catalog',
                'item' => [
                    'title' => 'Products',
                    'href' => '/products',
                    'icon' => 'Package',
                ],
            ],
            BusinessPermissionKey::ManageInventory->value => [
                'group' => 'Catalog',
                'item' => [
                    'title' => 'Inventory',
                    'href' => '/inventory',
                    'icon' => 'Boxes',
                ],
            ],
            BusinessPermissionKey::ViewSales->value => [
                'group' => 'Operations',
                'item' => [
                    'title' => 'Sales',
                    'href' => '/sales',
                    'icon' => 'Receipt',
                ],
            ],
            BusinessPermissionKey::ManageCustomers->value => [
                'group' => 'Operations',
                'item' => [
                    'title' => 'Customers',
                    'href' => '/customers',
                    'icon' => 'Users',
                ],
            ],
            BusinessPermissionKey::ManagePayments->value => [
                'group' => 'Operations',
                'item' => [
                    'title' => 'Payments',
                    'href' => '/payments',
                    'icon' => 'CreditCard',
                ],
            ],
            BusinessPermissionKey::ManageExpenses->value => [
                'group' => 'Operations',
                'item' => [
                    'title' => 'Expenses',
                    'href' => '/expenses',
                    'icon' => 'WalletCards',
                ],
            ],
            BusinessPermissionKey::ViewReports->value => [
                'group' => 'Operations',
                'item' => [
                    'title' => 'Reports',
                    'href' => '/reports',
                    'icon' => 'ChartNoAxesCombined',
                ],
            ],
            BusinessPermissionKey::ManageEmployees->value => [
                'group' => 'Team',
                'item' => [
                    'title' => 'Employees',
                    'href' => '/cashiers',
                    'icon' => 'UserRound',
                ],
            ],
            BusinessPermissionKey::ViewNotifications->value => [
                'group' => 'Settings',
                'item' => [
                    'title' => 'Notifications',
                    'href' => '/notifications',
                    'icon' => 'Bell',
                ],
            ],
        ] as $permission => $entry) {
            if ($user->hasBusinessPermission($permission)) {
                $groups[$entry['group']][] = $entry['item'];
            }
        }

        $groups['Settings'][] = [
            'title' => 'Profile',
            'href' => '/settings/profile',
            'icon' => 'UserRound',
        ];

        $navigation = [];

        foreach ($groups as $label => $items) {
            if ($items !== []) {
                $navigation[] = [
                    'label' => $label,
                    'items' => $items,
                ];
            }
        }

        return $navigation;
    }
}