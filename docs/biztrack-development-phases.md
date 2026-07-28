# BizTrack Development Phases

## Phase 1: Foundation

Build authentication, role access, business registration/profile, dashboards, notification base, and audit log base.

Required files:
- `app/Enums/UserRole.php`
- `app/Enums/RecordStatus.php`
- `app/Http/Middleware/EnsureUserHasRole.php`
- `app/Http/Controllers/BusinessProfileController.php`
- `app/Http/Requests/BusinessProfileRequest.php`
- `app/Services/BusinessProfileService.php`
- `app/Models/Business.php`
- `app/Models/Subscription.php`
- `app/Models/AuditLog.php`
- `app/Models/Notification.php`
- `database/migrations/*_create_biztrack_foundation_tables.php`
- `resources/js/pages/business/profile.tsx`
- `resources/js/pages/dashboard.tsx`

API and web routes:
- `GET /dashboard`
- `GET /business/profile`
- `POST /business/profile`
- `PUT /business/profile`
- Future API prefix: `/api/v1`

## Phase 2: Master Data

Build categories, products, inventory, customers, expense categories, and cashier management.

Required files:
- Models: `Category`, `Product`, `Inventory`, `InventoryTransaction`, `Customer`, `ExpenseCategory`
- Controllers: `CategoryController`, `ProductController`, `InventoryController`, `CustomerController`, `ExpenseCategoryController`, `CashierController`
- Requests for store/update operations
- Policies for each owner/cashier-accessible resource
- Services for inventory changes and cashier provisioning
- React pages under `resources/js/pages/{categories,products,inventory,customers,expenses,cashiers}`

API routes:
- `/api/v1/categories`
- `/api/v1/products`
- `/api/v1/inventory`
- `/api/v1/customers`
- `/api/v1/expense-categories`
- `/api/v1/cashiers`

## Phase 3: Business Operations

Build sales, sale items, payments, customer credit, expenses, receipts, and revenue calculations.

API routes:
- `/api/v1/sales`
- `/api/v1/payments`
- `/api/v1/customer-credit`
- `/api/v1/expenses`
- `/api/v1/receipts`

## Phase 4: Intelligence

Build reports, profit calculations, tax reports, inventory reports, sales/expense reports, dashboard charts, and KPI cards.

API routes:
- `/api/v1/reports/sales`
- `/api/v1/reports/expenses`
- `/api/v1/reports/profit`
- `/api/v1/reports/inventory`
- `/api/v1/reports/tax`

## Phase 5: Administration

Build super admin dashboard, subscription plans, business management, audit logs, platform reports, and Chapa integration settings.

API routes:
- `/api/v1/admin/businesses`
- `/api/v1/admin/subscriptions`
- `/api/v1/admin/audit-logs`
- `/api/v1/admin/reports`
