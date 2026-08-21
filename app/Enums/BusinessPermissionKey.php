<?php

namespace App\Enums;

enum BusinessPermissionKey: string
{
    case ViewDashboard = 'view_dashboard';
    case ManageProducts = 'manage_products';
    case ManageCategories = 'manage_categories';
    case ManageInventory = 'manage_inventory';
    case ManageCustomers = 'manage_customers';
    case CreateSales = 'create_sales';
    case ViewSales = 'view_sales';
    case ManagePayments = 'manage_payments';
    case ManageExpenses = 'manage_expenses';
    case ViewReports = 'view_reports';
    case ManageEmployees = 'manage_employees';
    case ViewNotifications = 'view_notifications';
    case AccessCredit = 'access_credit';
    case AccessDiscount = 'access_discount';

    public function label(): string
    {
        if ($this === self::ManageExpenses) {
            return 'Manage Transactions';
        }

        return str($this->value)->replace('_', ' ')->title()->toString();
    }

    public function group(): string
    {
        return match ($this) {
            self::ViewDashboard => 'Dashboard',
            self::ManageProducts, self::ManageCategories => 'Catalog',
            self::ManageInventory => 'Inventory',
            self::ManageCustomers => 'Customers',
            self::CreateSales, self::ViewSales, self::AccessCredit, self::AccessDiscount => 'Sales',
            self::ManagePayments => 'Payments',
            self::ManageExpenses => 'Transactions',
            self::ViewReports => 'Reports',
            self::ManageEmployees => 'Team',
            self::ViewNotifications => 'Notifications',
        };
    }
}
