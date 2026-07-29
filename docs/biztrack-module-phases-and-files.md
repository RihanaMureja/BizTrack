# BizTrack Module Phases And Files

This plan is module-first. The core modules come before sales, payments, reporting, and administration because those later modules depend on owner tenancy, products, inventory, customers, and RBAC being correct.

## Phase 0: Project Foundation And Architecture

Purpose:
- Establish clean Laravel/Inertia structure, shared enums, base middleware, shared navigation, tenant ownership rules, and project documentation.

Already started:
- `docs/biztrack-development-phases.md`
- `docs/biztrack-module-phases-and-files.md`
- `app/Enums/UserRole.php`
- `app/Enums/RecordStatus.php`
- `app/Http/Middleware/EnsureUserHasRole.php`
- `app/Http/Middleware/HandleInertiaRequests.php`
- `bootstrap/app.php`
- `resources/js/components/app-sidebar.tsx`
- `resources/js/types/navigation.ts`
- `resources/js/types/global.d.ts`

Files to create next:
- `app/Enums/PaymentMethod.php`
- `app/Enums/PaymentStatus.php`
- `app/Enums/SalePaymentStatus.php`
- `app/Enums/InventoryTransactionType.php`
- `app/Enums/CustomerCreditStatus.php`
- `app/Enums/NotificationType.php`
- `app/Enums/ReportType.php`
- `app/Http/Middleware/EnsureBusinessIsActive.php`
- `app/Http/Middleware/EnsureUserBusinessScope.php`
- `app/Services/AuditLogger.php`
- `app/Observers/AuditObserver.php`
- `app/Traits/BelongsToBusiness.php`
- `app/Traits/HasStatus.php`
- `routes/api.php`
- `app/Http/Controllers/Api/V1/BaseApiController.php`

API base:
- `GET /api/v1/health`
- All protected API routes use `auth:sanctum`, `verified`, role middleware, and business scope checks.

## Phase 1: Authentication, RBAC, And Business Profile Core

Purpose:
- Owners register, users log in securely, roles control routes/sidebar, and an owner can create/update the business profile.

Already started:
- `app/Actions/Fortify/CreateNewUser.php`
- `app/Http/Controllers/BusinessProfileController.php`
- `app/Http/Requests/BusinessProfileRequest.php`
- `app/Services/BusinessProfileService.php`
- `app/Models/User.php`
- `app/Models/Business.php`
- `app/Models/Subscription.php`
- `database/migrations/2026_07_28_000001_create_biztrack_foundation_tables.php`
- `resources/js/pages/auth/register.tsx`
- `resources/js/pages/business/profile.tsx`
- `resources/js/pages/dashboard.tsx`
- `routes/web.php`

Files to create next:
- `app/Policies/BusinessPolicy.php`
- `app/Http/Resources/BusinessResource.php`
- `app/Http/Controllers/Api/V1/BusinessProfileApiController.php`
- `database/factories/BusinessFactory.php`
- `database/factories/SubscriptionFactory.php`
- `database/seeders/SubscriptionSeeder.php`
- `database/seeders/RolesAndUsersSeeder.php`
- `tests/Feature/BusinessProfileTest.php`
- `tests/Feature/RbacNavigationTest.php`

Web routes:
- `GET /dashboard`
- `GET /business/profile`
- `POST /business/profile`
- `PUT /business/profile`

API routes:
- `GET /api/v1/business/profile`
- `POST /api/v1/business/profile`
- `PUT /api/v1/business/profile`

## Phase 2: Categories Core Module

Purpose:
- Owners organize products into reusable business-owned groups.

Tables:
- `categories`

Files:
- `app/Models/Category.php`
- `app/Http/Controllers/CategoryController.php`
- `app/Http/Controllers/Api/V1/CategoryApiController.php`
- `app/Http/Requests/Category/StoreCategoryRequest.php`
- `app/Http/Requests/Category/UpdateCategoryRequest.php`
- `app/Http/Resources/CategoryResource.php`
- `app/Policies/CategoryPolicy.php`
- `app/Services/CategoryService.php`
- `database/factories/CategoryFactory.php`
- `tests/Feature/Categories/CategoryCrudTest.php`
- `resources/js/pages/categories/index.tsx`
- `resources/js/pages/categories/create.tsx`
- `resources/js/pages/categories/edit.tsx`
- `resources/js/components/categories/category-form.tsx`
- `resources/js/components/categories/category-table.tsx`

API routes:
- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `GET /api/v1/categories/{category}`
- `PUT /api/v1/categories/{category}`
- `DELETE /api/v1/categories/{category}`

## Phase 3: Products Core Module

Purpose:
- Owners manage sellable items with barcode, pricing, category, unit, reorder level, and active/inactive state.

Tables:
- `products`
- `inventory`

Files:
- `app/Models/Product.php`
- `app/Models/Inventory.php`
- `app/Http/Controllers/ProductController.php`
- `app/Http/Controllers/Api/V1/ProductApiController.php`
- `app/Http/Requests/Product/StoreProductRequest.php`
- `app/Http/Requests/Product/UpdateProductRequest.php`
- `app/Http/Resources/ProductResource.php`
- `app/Policies/ProductPolicy.php`
- `app/Services/ProductService.php`
- `database/factories/ProductFactory.php`
- `database/factories/InventoryFactory.php`
- `tests/Feature/Products/ProductCrudTest.php`
- `resources/js/pages/products/index.tsx`
- `resources/js/pages/products/create.tsx`
- `resources/js/pages/products/edit.tsx`
- `resources/js/components/products/product-form.tsx`
- `resources/js/components/products/product-table.tsx`
- `resources/js/components/products/product-filters.tsx`

API routes:
- `GET /api/v1/products`
- `POST /api/v1/products`
- `GET /api/v1/products/{product}`
- `PUT /api/v1/products/{product}`
- `DELETE /api/v1/products/{product}`
- `GET /api/v1/products/search`

## Phase 4: Inventory Core Module

Purpose:
- Track stock, stock adjustments, restocks, damaged stock, returns, and low-stock alerts.

Tables:
- `inventory`
- `inventory_transactions`
- `notifications`

Files:
- `app/Models/InventoryTransaction.php`
- `app/Http/Controllers/InventoryController.php`
- `app/Http/Controllers/InventoryTransactionController.php`
- `app/Http/Controllers/Api/V1/InventoryApiController.php`
- `app/Http/Requests/Inventory/AdjustInventoryRequest.php`
- `app/Http/Resources/InventoryResource.php`
- `app/Http/Resources/InventoryTransactionResource.php`
- `app/Policies/InventoryPolicy.php`
- `app/Services/InventoryService.php`
- `app/Events/InventoryAdjusted.php`
- `app/Events/LowStockDetected.php`
- `app/Listeners/CreateLowStockNotification.php`
- `database/migrations/*_create_inventory_transactions_table.php`
- `database/factories/InventoryTransactionFactory.php`
- `tests/Feature/Inventory/InventoryAdjustmentTest.php`
- `resources/js/pages/inventory/index.tsx`
- `resources/js/pages/inventory/history.tsx`
- `resources/js/components/inventory/adjust-stock-dialog.tsx`
- `resources/js/components/inventory/inventory-table.tsx`

API routes:
- `GET /api/v1/inventory`
- `POST /api/v1/inventory/{product}/adjust`
- `GET /api/v1/inventory/{product}/transactions`

## Phase 5: Customers Core Module

Purpose:
- Manage customer records, balances, and later purchase/credit history.

Tables:
- `customers`
- later: `sales`, `customer_credit`

Files:
- `app/Models/Customer.php`
- `app/Http/Controllers/CustomerController.php`
- `app/Http/Controllers/Api/V1/CustomerApiController.php`
- `app/Http/Requests/Customer/StoreCustomerRequest.php`
- `app/Http/Requests/Customer/UpdateCustomerRequest.php`
- `app/Http/Resources/CustomerResource.php`
- `app/Policies/CustomerPolicy.php`
- `app/Services/CustomerService.php`
- `database/factories/CustomerFactory.php`
- `tests/Feature/Customers/CustomerCrudTest.php`
- `resources/js/pages/customers/index.tsx`
- `resources/js/pages/customers/create.tsx`
- `resources/js/pages/customers/edit.tsx`
- `resources/js/pages/customers/show.tsx`
- `resources/js/components/customers/customer-form.tsx`
- `resources/js/components/customers/customer-table.tsx`

API routes:
- `GET /api/v1/customers`
- `POST /api/v1/customers`
- `GET /api/v1/customers/{customer}`
- `PUT /api/v1/customers/{customer}`
- `DELETE /api/v1/customers/{customer}`
- `GET /api/v1/customers/search`

## Phase 6: Expense Categories Core Module

Purpose:
- Categorize expenses before the expense module is built.

Tables:
- `expense_categories`

Files:
- `app/Models/ExpenseCategory.php`
- `app/Http/Controllers/ExpenseCategoryController.php`
- `app/Http/Controllers/Api/V1/ExpenseCategoryApiController.php`
- `app/Http/Requests/ExpenseCategory/StoreExpenseCategoryRequest.php`
- `app/Http/Requests/ExpenseCategory/UpdateExpenseCategoryRequest.php`
- `app/Http/Resources/ExpenseCategoryResource.php`
- `app/Policies/ExpenseCategoryPolicy.php`
- `app/Services/ExpenseCategoryService.php`
- `database/migrations/*_create_expense_categories_table.php`
- `database/factories/ExpenseCategoryFactory.php`
- `tests/Feature/ExpenseCategories/ExpenseCategoryCrudTest.php`
- `resources/js/pages/expense-categories/index.tsx`
- `resources/js/components/expense-categories/expense-category-form.tsx`
- `resources/js/components/expense-categories/expense-category-table.tsx`

API routes:
- `GET /api/v1/expense-categories`
- `POST /api/v1/expense-categories`
- `PUT /api/v1/expense-categories/{expenseCategory}`
- `DELETE /api/v1/expense-categories/{expenseCategory}`

## Phase 7: Cashiers Core Module

Purpose:
- Owners create, edit, deactivate, delete, and reset passwords for cashier users under their business.

Tables:
- `users`

Files:
- `app/Http/Controllers/CashierController.php`
- `app/Http/Controllers/Api/V1/CashierApiController.php`
- `app/Http/Requests/Cashier/StoreCashierRequest.php`
- `app/Http/Requests/Cashier/UpdateCashierRequest.php`
- `app/Http/Requests/Cashier/ResetCashierPasswordRequest.php`
- `app/Http/Resources/CashierResource.php`
- `app/Policies/CashierPolicy.php`
- `app/Services/CashierService.php`
- `app/Notifications/CashierPasswordResetNotification.php`
- `tests/Feature/Cashiers/CashierManagementTest.php`
- `resources/js/pages/cashiers/index.tsx`
- `resources/js/pages/cashiers/create.tsx`
- `resources/js/pages/cashiers/edit.tsx`
- `resources/js/components/cashiers/cashier-form.tsx`
- `resources/js/components/cashiers/cashier-table.tsx`

API routes:
- `GET /api/v1/cashiers`
- `POST /api/v1/cashiers`
- `PUT /api/v1/cashiers/{cashier}`
- `DELETE /api/v1/cashiers/{cashier}`
- `POST /api/v1/cashiers/{cashier}/reset-password`

## Phase 8: Sales And POS Module

Purpose:
- Cashiers and owners record sales, add sale items, apply discount/tax, generate invoices, and reduce inventory safely.

Tables:
- `sales`
- `sale_items`
- `payments`
- `inventory`
- `inventory_transactions`

Files:
- `app/Models/Sale.php`
- `app/Models/SaleItem.php`
- `app/Http/Controllers/SaleController.php`
- `app/Http/Controllers/ReceiptController.php`
- `app/Http/Controllers/Api/V1/SaleApiController.php`
- `app/Http/Requests/Sale/StoreSaleRequest.php`
- `app/Http/Resources/SaleResource.php`
- `app/Http/Resources/SaleItemResource.php`
- `app/Policies/SalePolicy.php`
- `app/Services/SaleService.php`
- `app/Services/InvoiceNumberService.php`
- `app/Events/SaleCompleted.php`
- `app/Listeners/ReduceInventoryAfterSale.php`
- `database/migrations/*_create_sales_table.php`
- `database/migrations/*_create_sale_items_table.php`
- `database/factories/SaleFactory.php`
- `database/factories/SaleItemFactory.php`
- `tests/Feature/Sales/SaleCheckoutTest.php`
- `resources/js/pages/sales/index.tsx`
- `resources/js/pages/sales/create.tsx`
- `resources/js/pages/sales/show.tsx`
- `resources/js/components/sales/pos-cart.tsx`
- `resources/js/components/sales/product-picker.tsx`
- `resources/js/components/sales/receipt-preview.tsx`

API routes:
- `GET /api/v1/sales`
- `POST /api/v1/sales`
- `GET /api/v1/sales/{sale}`
- `GET /api/v1/sales/{sale}/receipt`

## Phase 9: Payments And Chapa Module

Purpose:
- Record cash/bank/Telebirr/Chapa payments, verify gateway transactions, and support partial payments.

Tables:
- `payments`
- `sales`
- `customer_credit`

Files:
- `app/Models/Payment.php`
- `app/Http/Controllers/PaymentController.php`
- `app/Http/Controllers/ChapaWebhookController.php`
- `app/Http/Controllers/Api/V1/PaymentApiController.php`
- `app/Http/Requests/Payment/StorePaymentRequest.php`
- `app/Http/Resources/PaymentResource.php`
- `app/Policies/PaymentPolicy.php`
- `app/Services/PaymentService.php`
- `app/Services/ChapaPaymentService.php`
- `app/Events/PaymentCompleted.php`
- `app/Listeners/UpdateSalePaymentStatus.php`
- `config/chapa.php`
- `database/migrations/*_create_payments_table.php`
- `database/factories/PaymentFactory.php`
- `tests/Feature/Payments/PaymentRecordingTest.php`
- `tests/Feature/Payments/ChapaWebhookTest.php`
- `resources/js/pages/payments/index.tsx`
- `resources/js/components/payments/payment-form.tsx`
- `resources/js/components/payments/payment-status-badge.tsx`

API routes:
- `GET /api/v1/payments`
- `POST /api/v1/payments`
- `GET /api/v1/payments/{payment}`
- `POST /api/v1/payments/chapa/initialize`
- `POST /api/v1/payments/chapa/webhook`

## Phase 10: Customer Credit Module

Purpose:
- Track pending, paid, and overdue customer credit balances.

Tables:
- `customer_credit`
- `customers`
- `sales`

Files:
- `app/Models/CustomerCredit.php`
- `app/Http/Controllers/CustomerCreditController.php`
- `app/Http/Controllers/Api/V1/CustomerCreditApiController.php`
- `app/Http/Requests/CustomerCredit/StoreCustomerCreditPaymentRequest.php`
- `app/Http/Resources/CustomerCreditResource.php`
- `app/Policies/CustomerCreditPolicy.php`
- `app/Services/CustomerCreditService.php`
- `app/Events/CustomerCreditOverdue.php`
- `app/Listeners/CreateCreditReminderNotification.php`
- `database/migrations/*_create_customer_credit_table.php`
- `database/factories/CustomerCreditFactory.php`
- `tests/Feature/CustomerCredit/CustomerCreditTest.php`
- `resources/js/pages/customer-credit/index.tsx`
- `resources/js/components/customer-credit/credit-payment-dialog.tsx`
- `resources/js/components/customer-credit/credit-table.tsx`

API routes:
- `GET /api/v1/customer-credit`
- `POST /api/v1/customer-credit/{customerCredit}/payments`
- `GET /api/v1/customers/{customer}/credit`

## Phase 11: Expenses Module

Purpose:
- Owners record daily expenses with categories and receipt uploads.

Tables:
- `expenses`
- `expense_categories`

Files:
- `app/Models/Expense.php`
- `app/Http/Controllers/ExpenseController.php`
- `app/Http/Controllers/Api/V1/ExpenseApiController.php`
- `app/Http/Requests/Expense/StoreExpenseRequest.php`
- `app/Http/Requests/Expense/UpdateExpenseRequest.php`
- `app/Http/Resources/ExpenseResource.php`
- `app/Policies/ExpensePolicy.php`
- `app/Services/ExpenseService.php`
- `database/migrations/*_create_expenses_table.php`
- `database/factories/ExpenseFactory.php`
- `tests/Feature/Expenses/ExpenseCrudTest.php`
- `resources/js/pages/expenses/index.tsx`
- `resources/js/pages/expenses/create.tsx`
- `resources/js/pages/expenses/edit.tsx`
- `resources/js/components/expenses/expense-form.tsx`
- `resources/js/components/expenses/expense-table.tsx`

API routes:
- `GET /api/v1/expenses`
- `POST /api/v1/expenses`
- `GET /api/v1/expenses/{expense}`
- `PUT /api/v1/expenses/{expense}`
- `DELETE /api/v1/expenses/{expense}`

## Phase 12: Reports And Analytics Module

Purpose:
- Generate sales, expenses, profit, inventory, and tax reports with dashboard KPIs and exports.

Tables:
- `reports`
- `sales`
- `sale_items`
- `payments`
- `expenses`
- `inventory`

Files:
- `app/Models/Report.php`
- `app/Http/Controllers/ReportController.php`
- `app/Http/Controllers/Api/V1/ReportApiController.php`
- `app/Http/Requests/Report/GenerateReportRequest.php`
- `app/Http/Resources/ReportResource.php`
- `app/Policies/ReportPolicy.php`
- `app/Services/Reports/SalesReportService.php`
- `app/Services/Reports/ExpenseReportService.php`
- `app/Services/Reports/ProfitReportService.php`
- `app/Services/Reports/InventoryReportService.php`
- `app/Services/Reports/TaxReportService.php`
- `app/Exports/SalesReportExport.php`
- `app/Exports/ExpenseReportExport.php`
- `app/Jobs/GenerateReportExport.php`
- `database/migrations/*_create_reports_table.php`
- `tests/Feature/Reports/ReportGenerationTest.php`
- `resources/js/pages/reports/index.tsx`
- `resources/js/pages/reports/show.tsx`
- `resources/js/components/reports/report-filters.tsx`
- `resources/js/components/reports/kpi-grid.tsx`
- `resources/js/components/reports/revenue-chart.tsx`

API routes:
- `GET /api/v1/reports`
- `POST /api/v1/reports`
- `GET /api/v1/reports/{report}`
- `GET /api/v1/reports/sales`
- `GET /api/v1/reports/expenses`
- `GET /api/v1/reports/profit`
- `GET /api/v1/reports/inventory`
- `GET /api/v1/reports/tax`

## Phase 13: Notifications Module

Purpose:
- Show database notifications, toast notices, low-stock alerts, payment notices, credit reminders, and daily summaries.

Tables:
- `notifications`

Files:
- `app/Models/Notification.php`
- `app/Http/Controllers/NotificationController.php`
- `app/Http/Controllers/Api/V1/NotificationApiController.php`
- `app/Http/Resources/NotificationResource.php`
- `app/Policies/NotificationPolicy.php`
- `app/Services/NotificationService.php`
- `app/Notifications/LowStockNotification.php`
- `app/Notifications/PaymentCompletedNotification.php`
- `app/Notifications/CreditReminderNotification.php`
- `app/Jobs/SendDailySummaryNotification.php`
- `tests/Feature/Notifications/NotificationTest.php`
- `resources/js/pages/notifications/index.tsx`
- `resources/js/components/notifications/notification-bell.tsx`
- `resources/js/components/notifications/notification-list.tsx`

API routes:
- `GET /api/v1/notifications`
- `POST /api/v1/notifications/{notification}/read`
- `POST /api/v1/notifications/read-all`

## Phase 14: Audit Logs Module

Purpose:
- Record logins, logouts, create/update/delete operations, payment actions, and inventory changes.

Tables:
- `audit_logs`

Files:
- `app/Models/AuditLog.php`
- `app/Http/Controllers/AuditLogController.php`
- `app/Http/Controllers/Api/V1/AuditLogApiController.php`
- `app/Http/Resources/AuditLogResource.php`
- `app/Policies/AuditLogPolicy.php`
- `app/Services/AuditLogService.php`
- `app/Listeners/LogSuccessfulLogin.php`
- `app/Listeners/LogLogout.php`
- `tests/Feature/AuditLogs/AuditLogTest.php`
- `resources/js/pages/audit-logs/index.tsx`
- `resources/js/components/audit-logs/audit-log-table.tsx`

API routes:
- `GET /api/v1/audit-logs`
- `GET /api/v1/audit-logs/{auditLog}`

## Phase 15: Super Admin And Subscriptions Module

Purpose:
- Platform admins manage businesses, owners, subscriptions, system reports, and monitoring.

Tables:
- `subscriptions`
- `businesses`
- `users`
- `reports`
- `audit_logs`

Files:
- `app/Http/Controllers/Admin/AdminDashboardController.php`
- `app/Http/Controllers/Admin/BusinessManagementController.php`
- `app/Http/Controllers/Admin/SubscriptionController.php`
- `app/Http/Controllers/Api/V1/Admin/AdminDashboardApiController.php`
- `app/Http/Controllers/Api/V1/Admin/BusinessManagementApiController.php`
- `app/Http/Controllers/Api/V1/Admin/SubscriptionApiController.php`
- `app/Http/Requests/Admin/StoreSubscriptionRequest.php`
- `app/Http/Requests/Admin/UpdateSubscriptionRequest.php`
- `app/Http/Resources/AdminBusinessResource.php`
- `app/Http/Resources/SubscriptionResource.php`
- `app/Policies/SubscriptionPolicy.php`
- `app/Services/Admin/AdminDashboardService.php`
- `app/Services/Admin/BusinessManagementService.php`
- `app/Services/Admin/SubscriptionService.php`
- `tests/Feature/Admin/SuperAdminAccessTest.php`
- `tests/Feature/Admin/SubscriptionManagementTest.php`
- `resources/js/pages/admin/dashboard.tsx`
- `resources/js/pages/admin/businesses/index.tsx`
- `resources/js/pages/admin/businesses/show.tsx`
- `resources/js/pages/admin/subscriptions/index.tsx`
- `resources/js/components/admin/subscription-form.tsx`
- `resources/js/components/admin/business-status-badge.tsx`

API routes:
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/businesses`
- `GET /api/v1/admin/businesses/{business}`
- `PUT /api/v1/admin/businesses/{business}/status`
- `GET /api/v1/admin/subscriptions`
- `POST /api/v1/admin/subscriptions`
- `PUT /api/v1/admin/subscriptions/{subscription}`
- `DELETE /api/v1/admin/subscriptions/{subscription}`

## Phase 16: Testing, Optimization, And Deployment

Purpose:
- Stabilize the system for production use.

Files:
- `tests/Feature/Auth/*`
- `tests/Feature/Rbac/*`
- `tests/Feature/*`
- `tests/Unit/Services/*`
- `app/Providers/AppServiceProvider.php`
- `config/cache.php`
- `config/queue.php`
- `.env.example`
- `README.md`
- `docs/deployment.md`
- `docs/testing-checklist.md`

Tasks:
- Add eager loading and pagination everywhere lists can grow.
- Add indexes for all frequent filters and foreign keys.
- Enable lazy-loading prevention in local development.
- Run `composer test`, `npm run lint:check`, `npm run format:check`, and `npm run types:check`.
- Build deployment notes for Laravel Herd/XAMPP local setup and production hosting.
