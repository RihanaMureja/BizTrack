
Below is the clean module-first development phase plan for BizTrack.

## Phase 1: Foundation, Authentication, And RBAC

This phase creates the base of the whole system. Users must be able to register, log in, log out, reset passwords, and access only the pages allowed for their role. The system will support three main roles: `super_admin`, `owner`, and `cashier`.

It also prepares middleware, enums, traits, and policies that future modules will depend on.

Files created or updated:

```text
app/Models/User.php

app/Http/Controllers/Auth/AuthenticatedSessionController.php
app/Http/Controllers/Auth/RegisteredUserController.php
app/Http/Controllers/Auth/PasswordResetLinkController.php
app/Http/Controllers/Auth/NewPasswordController.php
app/Http/Controllers/Auth/VerifyEmailController.php
app/Http/Controllers/Auth/EmailVerificationPromptController.php
app/Http/Controllers/Auth/ConfirmablePasswordController.php
app/Http/Controllers/Auth/PasswordController.php

app/Http/Requests/LoginRequest.php
app/Http/Requests/RegisterRequest.php
app/Http/Requests/UpdatePasswordRequest.php

app/Services/AuthService.php
app/Services/RBACService.php

app/Policies/UserPolicy.php

app/Http/Middleware/RoleMiddleware.php
app/Http/Middleware/LogActivity.php

app/Traits/HasRoles.php
app/Traits/LogsActivity.php

app/Enums/Role.php

routes/auth.php
routes/web.php

resources/js/Pages/Auth/
resources/js/Layouts/AuthLayout.jsx
```

Implements:

```text
User registration
Login
Logout
Forgot password
Reset password
Email verification
Role assignment
Role-based route protection
Dynamic sidebar permissions
Basic activity logging
```

## Phase 2: Business Registration And Subscription Setup

This phase allows a business owner to register or update their business profile. It also introduces subscription plans, which later control limits like maximum cashiers.

This phase is important because almost every business module belongs to a business.

Files created or updated:

```text
app/Models/Business.php
app/Models/Subscription.php

app/Http/Controllers/BusinessController.php
app/Http/Controllers/SubscriptionController.php

app/Http/Requests/StoreBusinessRequest.php
app/Http/Requests/UpdateBusinessRequest.php

app/Services/BusinessService.php
app/Services/SubscriptionService.php

app/Policies/BusinessPolicy.php

app/Http/Middleware/BusinessMiddleware.php
app/Http/Middleware/EnsureBusinessIsActive.php
app/Http/Middleware/EnsureSubscriptionIsActive.php

app/Events/BusinessRegistered.php

app/Notifications/BusinessApprovedNotification.php

database/seeders/SubscriptionSeeder.php
database/factories/BusinessFactory.php

resources/js/Pages/Business/
resources/js/Components/Forms/BusinessForm.jsx
```

Implements:

```text
Business profile creation
Business profile update
Business status management
Subscription plan selection
Active/inactive business checks
Owner-to-business relationship
Business approval notification
```

## Phase 3: Dashboard Module

This phase builds dashboards for each role. The dashboard is not just one page; it changes based on the logged-in user role.

The owner sees business performance. The cashier sees today’s sales activity. The super admin sees platform-level statistics.

Files created or updated:

```text
app/Http/Controllers/DashboardController.php

app/Services/DashboardService.php
app/Services/RevenueService.php

resources/js/Pages/Dashboard/
resources/js/Layouts/DashboardLayout.jsx

resources/js/Components/StatCard/
resources/js/Components/Charts/
```

Implements:

```text
Owner dashboard
Cashier dashboard
Super admin dashboard
Revenue summary
Sales summary
Expense summary
Low stock preview
Top products preview
Role-based dashboard data
```

## Phase 4: Category Module

This phase creates product categories. Categories are required before products are fully useful because products belong to categories.

Only business owners should manage categories. Cashiers may view categories indirectly through sales/product search.

Files created or updated:

```text
app/Models/Category.php

app/Http/Controllers/CategoryController.php

app/Http/Requests/StoreCategoryRequest.php
app/Http/Requests/UpdateCategoryRequest.php

app/Services/CategoryService.php

app/Policies/CategoryPolicy.php

database/seeders/CategorySeeder.php
database/factories/CategoryFactory.php

resources/js/Pages/Categories/
resources/js/Components/DataTable/
resources/js/Components/SearchBox/
resources/js/Components/Pagination/
resources/js/Components/ConfirmDialog/
resources/js/Components/DeleteDialog/
```

Implements:

```text
Create category
Update category
Delete category
List categories
Search categories
Business-owned category protection
Category validation
```

## Phase 5: Product Module

This phase creates the product catalog. Products include barcode, prices, unit, category, reorder level, and status.

Products are central because inventory, sales, reports, and receipts all depend on them.

Files created or updated:

```text
app/Models/Product.php

app/Http/Controllers/ProductController.php

app/Http/Requests/StoreProductRequest.php
app/Http/Requests/UpdateProductRequest.php

app/Services/ProductService.php

app/Policies/ProductPolicy.php

app/Observers/ProductObserver.php

database/seeders/ProductSeeder.php
database/factories/ProductFactory.php

resources/js/Pages/Products/
resources/js/Components/ProductCard/
resources/js/Components/Forms/ProductForm.jsx
resources/js/Components/DataTable/
```

Implements:

```text
Create product
Update product
Delete/deactivate product
List products
Search products
Filter by category
Barcode support
Buy price and selling price
Reorder level setup
Automatic inventory record creation
```

## Phase 6: Inventory Module

This phase tracks stock levels for every product. It handles restocking, stock adjustment, damaged stock, returns, and low-stock detection.

Inventory must be completed before sales because sales reduce stock automatically.

Files created or updated:

```text
app/Models/Inventory.php
app/Models/InventoryTransaction.php

app/Http/Controllers/InventoryController.php
app/Http/Controllers/InventoryTransactionController.php

app/Http/Requests/StockAdjustmentRequest.php
app/Http/Requests/RestockRequest.php

app/Services/InventoryService.php

app/Policies/InventoryPolicy.php

app/Events/InventoryLow.php

app/Listeners/SendLowStockNotification.php

app/Notifications/LowStockNotification.php

resources/js/Pages/Inventory/
resources/js/Components/Alerts/
resources/js/Components/Modals/
```

Implements:

```text
View stock levels
Restock products
Adjust stock manually
Record damaged stock
Record inventory returns
Track inventory history
Detect low stock
Send low-stock notifications
Prevent invalid stock changes
```

## Phase 7: Customer Module

This phase creates customer management. Customers can later be attached to sales, payments, receipts, and customer credit.

Both owners and cashiers can manage customers depending on permissions.

Files created or updated:

```text
app/Models/Customer.php

app/Http/Controllers/CustomerController.php

app/Http/Requests/StoreCustomerRequest.php
app/Http/Requests/UpdateCustomerRequest.php

app/Services/CustomerService.php

app/Policies/CustomerPolicy.php

database/seeders/CustomerSeeder.php
database/factories/CustomerFactory.php

resources/js/Pages/Customers/
resources/js/Components/Forms/CustomerForm.jsx
resources/js/Components/DataTable/
```

Implements:

```text
Create customer
Update customer
Delete customer
Search customer
View customer profile
Track credit limit
Track current balance
Prepare customer purchase history
Business-owned customer protection
```

## Phase 8: Cashier Module

This phase allows business owners to manage cashier accounts under their business.

Cashiers have limited permissions. They should only access sales, customers, payments, receipts, and profile-related pages.

Files created or updated:

```text
app/Http/Controllers/CashierController.php

app/Http/Requests/StoreCashierRequest.php
app/Http/Requests/UpdateCashierRequest.php

app/Services/CashierService.php

app/Policies/CashierPolicy.php

app/Events/CashierCreated.php

database/seeders/UserSeeder.php
database/factories/UserFactory.php

resources/js/Pages/Cashiers/
resources/js/Components/Forms/CashierForm.jsx
```

Implements:

```text
Create cashier
Update cashier
Deactivate cashier
Delete cashier
Reset cashier password
Limit cashier count by subscription
Assign cashier role
Restrict cashier sidebar items
```

## Phase 9: Sales And POS Module

This phase builds the point-of-sale workflow. Cashiers and owners can create sales, add products to cart, calculate totals, apply tax/discount, and generate invoices.

This phase also triggers inventory updates, revenue calculations, audit logs, and notifications.

Files created or updated:

```text
app/Models/Sale.php
app/Models/SaleItem.php

app/Http/Controllers/SaleController.php

app/Http/Requests/StoreSaleRequest.php
app/Http/Requests/UpdateSaleRequest.php

app/Services/SaleService.php
app/Services/RevenueService.php

app/Policies/SalePolicy.php

app/Events/SaleCompleted.php

app/Listeners/UpdateInventory.php
app/Listeners/GenerateReceipt.php
app/Listeners/CalculateRevenue.php
app/Listeners/CreateAuditLog.php

app/Observers/SaleObserver.php

database/factories/SaleFactory.php

resources/js/Pages/Sales/
resources/js/Components/Forms/
resources/js/Components/Modals/
```

Implements:

```text
POS screen
Product search
Barcode-ready product selection
Cart management
Sale subtotal calculation
Tax calculation
Discount calculation
Grand total calculation
Invoice number generation
Sale item creation
Inventory reduction
Sale audit logging
Receipt generation
```

## Phase 10: Payment Module

This phase records payments for sales. It supports cash, bank, Telebirr, and Chapa. It also supports payment verification and payment status tracking.

Files created or updated:

```text
app/Models/Payment.php

app/Http/Controllers/PaymentController.php

app/Http/Requests/StorePaymentRequest.php
app/Http/Requests/VerifyPaymentRequest.php

app/Services/PaymentService.php

app/Policies/PaymentPolicy.php

app/Enums/PaymentMethod.php
app/Enums/PaymentStatus.php

app/Events/PaymentCompleted.php

app/Listeners/SendPaymentNotification.php

app/Notifications/PaymentReceivedNotification.php

app/Observers/PaymentObserver.php

resources/js/Pages/Payments/
```

Implements:

```text
Record payment
Verify payment
Track pending/completed/failed payments
Support cash payment
Support bank payment
Support Telebirr payment
Prepare Chapa payment integration
Update sale payment status
Send payment notification
Log payment activity
```

## Phase 11: Customer Credit Module

This phase handles credit sales. If a customer does not fully pay during a sale, the remaining balance is tracked as credit.

Files created or updated:

```text
app/Models/CustomerCredit.php

app/Http/Controllers/CustomerCreditController.php

app/Services/CustomerService.php
app/Services/PaymentService.php

app/Enums/PaymentStatus.php

app/Notifications/CreditReminderNotification.php

resources/js/Pages/Customers/
resources/js/Pages/Payments/
```

Implements:

```text
Create customer credit
Track credit amount
Track paid amount
Track remaining balance
Set due date
Mark credit as paid
Mark credit as overdue
Send credit reminder notification
Update customer balance
```

## Phase 12: Expense And Expense Category Module

This phase records business expenses. Expenses are grouped by expense categories and later used in profit and tax reports.

Files created or updated:

```text
app/Models/Expense.php
app/Models/ExpenseCategory.php

app/Http/Controllers/ExpenseController.php
app/Http/Controllers/ExpenseCategoryController.php

app/Http/Requests/StoreExpenseRequest.php
app/Http/Requests/UpdateExpenseRequest.php
app/Http/Requests/StoreExpenseCategoryRequest.php

app/Services/ExpenseService.php

app/Policies/ExpensePolicy.php

app/Enums/ExpenseStatus.php

app/Events/ExpenseRecorded.php

app/Observers/ExpenseObserver.php

database/seeders/ExpenseSeeder.php
database/factories/ExpenseFactory.php

resources/js/Pages/Expenses/
```

Implements:

```text
Create expense category
Create expense
Update expense
Delete expense
Upload receipt
Filter expenses by date/category
Calculate total expenses
Log expense activity
Feed expense data into reports
```

## Phase 13: Reports Module

This phase creates business reports. Reports help owners understand sales, expenses, profit, inventory, and tax summaries.

Files created or updated:

```text
app/Models/Report.php

app/Http/Controllers/ReportController.php

app/Http/Requests/GenerateReportRequest.php

app/Services/ReportService.php

app/Policies/ReportPolicy.php

app/Helpers/ReportHelper.php
app/Helpers/DateHelper.php
app/Helpers/CurrencyHelper.php

app/Enums/SaleStatus.php

resources/js/Pages/Reports/
resources/js/Components/Charts/
```

Implements:

```text
Sales report
Expense report
Profit report
Inventory report
Tax report
Date range filtering
Report generation
Dashboard charts
Export-ready report structure
Store generated report metadata
```

## Phase 14: Notifications Module

This phase centralizes all system notifications. Notifications are created by events like low stock, completed payments, credit reminders, and daily summaries.

Files created or updated:

```text
app/Models/Notification.php

app/Http/Controllers/NotificationController.php

app/Services/NotificationService.php

app/Policies/NotificationPolicy.php

app/Enums/NotificationType.php

app/Notifications/LowStockNotification.php
app/Notifications/PaymentReceivedNotification.php
app/Notifications/CreditReminderNotification.php
app/Notifications/DailySalesNotification.php

resources/js/Pages/Notifications/
resources/js/Components/Toast/
resources/js/Components/Alerts/
```

Implements:

```text
List notifications
Mark notification as read
Mark all as read
Low-stock notifications
Payment notifications
Credit reminders
Daily sales notifications
Toast messages
Unread notification count
```

## Phase 15: Audit Logging Module

This phase records important system activities. It helps track who did what, when, and from which IP address.

Files created or updated:

```text
app/Models/AuditLog.php

app/Services/AuditLogService.php

app/Listeners/CreateAuditLog.php

app/Observers/SaleObserver.php
app/Observers/ProductObserver.php
app/Observers/ExpenseObserver.php
app/Observers/PaymentObserver.php

app/Traits/LogsActivity.php

resources/js/Pages/Admin/AuditLogs/
```

Implements:

```text
Log login
Log logout
Log create actions
Log update actions
Log delete actions
Log sale activity
Log payment activity
Log inventory activity
Store old values
Store new values
Store user IP address
```

## Phase 16: Super Admin Module

This phase gives platform administrators control over the whole system.

Super admins can manage businesses, users, subscriptions, platform reports, and audit logs.

Files created or updated:

```text
app/Http/Controllers/SuperAdminController.php
app/Http/Controllers/BusinessManagementController.php
app/Http/Controllers/UserManagementController.php
app/Http/Controllers/RoleController.php
app/Http/Controllers/PermissionController.php

app/Services/BusinessService.php
app/Services/SubscriptionService.php
app/Services/RBACService.php
app/Services/ReportService.php

app/Policies/UserPolicy.php
app/Policies/BusinessPolicy.php

database/seeders/RoleSeeder.php
database/seeders/PermissionSeeder.php
database/seeders/SuperAdminSeeder.php
database/seeders/BusinessSeeder.php

resources/js/Pages/Admin/
resources/js/Layouts/AdminLayout.jsx
```

Implements:

```text
Super admin dashboard
Manage businesses
Approve/deactivate businesses
Manage business owners
Manage subscriptions
Manage roles
Manage permissions
View platform reports
View audit logs
Monitor system activity
```

## Phase 17: Settings And Profile Module

This phase allows users to manage their personal account, profile, password, and application preferences.

Files created or updated:

```text
app/Http/Controllers/ProfileController.php
app/Http/Controllers/SettingsController.php

app/Http/Requests/UpdatePasswordRequest.php

resources/js/Pages/Settings/
resources/js/Layouts/AppLayout.jsx
```

Implements:

```text
Update profile
Change password
Manage account settings
User preferences
Profile page
Settings page
```

## Phase 18: Helpers, UI Components, And Layout Polish

This phase improves developer productivity and frontend consistency. It creates reusable helpers and UI components used across all modules.

Files created or updated:

```text
app/Helpers/CurrencyHelper.php
app/Helpers/DateHelper.php
app/Helpers/BarcodeHelper.php
app/Helpers/ReportHelper.php

resources/js/Components/Sidebar/
resources/js/Components/Navbar/
resources/js/Components/Breadcrumbs/
resources/js/Components/DataTable/
resources/js/Components/SearchBox/
resources/js/Components/Pagination/
resources/js/Components/ConfirmDialog/
resources/js/Components/DeleteDialog/
resources/js/Components/ProductCard/
resources/js/Components/StatCard/
resources/js/Components/Charts/
resources/js/Components/Forms/
resources/js/Components/Buttons/
resources/js/Components/Modals/
resources/js/Components/Alerts/
resources/js/Components/Toast/

resources/js/Layouts/AppLayout.jsx
resources/js/Layouts/AuthLayout.jsx
resources/js/Layouts/AdminLayout.jsx
resources/js/Layouts/DashboardLayout.jsx
```

Implements:

```text
Reusable tables
Reusable forms
Reusable modals
Reusable buttons
Reusable stat cards
Reusable chart components
Consistent sidebar
Consistent navbar
Consistent breadcrumbs
Currency formatting
Date formatting
Barcode helpers
Report helpers
```

Below is a clean 5-phase plan for improving BizTrack professionally. These phases build on the current system without rushing implementation.

# Phase 19: Platform Service Fee Module

## Purpose

This phase adds a new BizTrack revenue stream besides subscriptions.

When a business records a payment, BizTrack calculates a service fee based on that business’s agreed fee rate. For example, if a payment of `5,000 ETB` is recorded and the service fee rate is `1%`, BizTrack records `50 ETB` as a service fee owed to the platform.

This should be dynamic per business because different business owners may agree to different service fee percentages.

## Creates

```text
app/Models/ServiceFee.php
app/Models/ServiceFeeSetting.php

app/Enums/ServiceFeeStatus.php

app/Http/Controllers/ServiceFeeController.php
app/Http/Controllers/AdminServiceFeeController.php

app/Http/Requests/UpdateServiceFeeSettingRequest.php
app/Http/Requests/PayServiceFeeRequest.php

app/Services/ServiceFeeService.php

app/Policies/ServiceFeePolicy.php

database/migrations/create_service_fee_settings_table.php
database/migrations/create_service_fees_table.php

database/factories/ServiceFeeFactory.php
database/factories/ServiceFeeSettingFactory.php

tests/Feature/ServiceFeeTest.php

resources/js/pages/service-fees/index.tsx
resources/js/pages/admin/service-fees/index.tsx

resources/js/components/service-fees/service-fee-summary.tsx
resources/js/components/service-fees/service-fee-table.tsx
resources/js/components/service-fees/service-fee-status-badge.tsx
```

## Updates

```text
app/Models/Business.php
app/Models/Payment.php

app/Services/PaymentService.php
app/Services/RBACService.php
app/Services/DashboardService.php

routes/web.php

resources/js/components/app-sidebar.tsx
resources/js/types/navigation.ts
```

## Implements

```text
Dynamic service fee percentage per business
Automatic service fee creation when payment is completed
Service fee dashboard page for business owner
Service fee total owed
Service fee paid/unpaid tracking
Service fee calculation explanation
Search and filtering by date, status, payment number, amount
Admin view of all business service fees
Pay service fee button
Audit logging for service fee payment
```

## Workflow

```text
Business records payment
        ↓
Payment becomes completed
        ↓
System checks business service fee setting
        ↓
System calculates fee percentage
        ↓
Service fee record is created
        ↓
Owner sees total service fee owed
        ↓
Owner pays service fee
        ↓
Fee status becomes paid
```

---

# Phase 20: Dynamic Employee Roles And Permissions

## Purpose

This phase replaces hard-coded employee access with business-controlled roles and permissions.

Instead of only having `cashier`, each business owner can create roles like:

```text
Cashier
Manager
Inventory Staff
Accountant
Sales Clerk
Branch Supervisor
```

Each role can have custom permissions selected by the owner.

This allows one business owner to give a trusted employee more access while another owner keeps employee access limited.

## Creates

```text
app/Models/BusinessRole.php
app/Models/BusinessPermission.php
app/Models/BusinessRolePermission.php

app/Enums/PermissionGroup.php

app/Http/Controllers/EmployeeController.php
app/Http/Controllers/BusinessRoleController.php
app/Http/Controllers/BusinessPermissionController.php

app/Http/Requests/StoreEmployeeRequest.php
app/Http/Requests/UpdateEmployeeRequest.php
app/Http/Requests/StoreBusinessRoleRequest.php
app/Http/Requests/UpdateBusinessRoleRequest.php
app/Http/Requests/AssignRolePermissionsRequest.php

app/Services/EmployeeService.php
app/Services/BusinessPermissionService.php
app/Services/BusinessRoleService.php

app/Policies/EmployeePolicy.php
app/Policies/BusinessRolePolicy.php

app/Http/Middleware/EnsureBusinessPermission.php

database/migrations/create_business_permissions_table.php
database/migrations/create_business_roles_table.php
database/migrations/create_business_role_permission_table.php
database/migrations/add_business_role_id_to_users_table.php

database/seeders/BusinessPermissionSeeder.php

database/factories/BusinessRoleFactory.php

tests/Feature/EmployeePermissionTest.php
tests/Feature/BusinessRoleTest.php

resources/js/pages/employees/index.tsx
resources/js/pages/roles/index.tsx
resources/js/pages/roles/show.tsx

resources/js/components/employees/employee-form.tsx
resources/js/components/roles/role-form.tsx
resources/js/components/roles/permission-matrix.tsx
```

## Updates

```text
app/Models/User.php
app/Enums/Role.php

app/Services/RBACService.php
app/Http/Middleware/RoleMiddleware.php

routes/web.php

resources/js/components/app-sidebar.tsx
resources/js/types/navigation.ts
```

## Implements

```text
Business-defined employee roles
Custom role names
Permission matrix
Owner assigns permissions when creating employee
Owner can update employee permissions later
Dynamic sidebar based on employee permissions
Backend route protection based on permissions
Cashier becomes one possible employee role instead of the only employee type
```

## Example Permissions

```text
view_dashboard
manage_products
manage_categories
manage_inventory
view_customers
manage_customers
create_sales
view_sales
manage_payments
manage_expenses
view_reports
manage_cashiers
view_notifications
```

## Workflow

```text
Owner creates business role
        ↓
Owner selects permissions
        ↓
Owner creates employee
        ↓
Owner assigns role to employee
        ↓
Employee logs in
        ↓
Sidebar shows only allowed modules
        ↓
Backend allows only permitted actions
```

---

# Phase 21: Stagnant Product Detection And Smart Notifications

## Purpose

This phase helps business owners detect products that are not selling.

The system checks products that have not been sold for a configurable number of days and notifies the owner to take action, such as discounting, promoting, restocking differently, or discontinuing the product.

This improves dashboard intelligence beyond low-stock alerts.

## Creates

```text
app/Models/ProductMovementInsight.php

app/Enums/ProductInsightType.php
app/Enums/ProductInsightStatus.php

app/Console/Commands/DetectStagnantProducts.php

app/Services/ProductInsightService.php

app/Notifications/StagnantProductNotification.php

database/migrations/create_product_movement_insights_table.php

database/factories/ProductMovementInsightFactory.php

tests/Feature/StagnantProductTest.php

resources/js/components/dashboard/stagnant-products-card.tsx
resources/js/pages/products/insights.tsx
```

## Updates

```text
app/Models/Product.php
app/Models/Business.php
app/Models/Notification.php

app/Services/DashboardService.php
app/Services/NotificationService.php
app/Services/ProductService.php

app/Http/Controllers/DashboardController.php
app/Http/Controllers/ProductController.php
app/Http/Controllers/SettingsController.php

routes/web.php
routes/console.php

resources/js/pages/dashboard.tsx
resources/js/pages/settings/preferences.tsx
resources/js/pages/notifications/index.tsx
```

## Implements

```text
Detect products not sold for X days
Business-level stagnant product preference
Owner notification for stagnant products
Dashboard stagnant product preview
Product insights page
Dismiss/resolved insight status
Suggested action text
Search/filter stagnant products
```

## Preference Options

```text
Enable stagnant product alerts
Days without sale threshold
Minimum stock quantity to consider stagnant
Notification frequency
```

## Workflow

```text
Scheduled command runs daily
        ↓
System checks product last sold date
        ↓
Product has stock but no sales for configured days
        ↓
Insight record is created
        ↓
Owner receives notification
        ↓
Dashboard shows stagnant product warning
        ↓
Owner discounts, promotes, or resolves insight
```

---

# Phase 22: Strong Passwords, Temporary Passwords, And Security Questions

## Purpose

This phase improves account security.

Business owners must use strong passwords during signup. When an owner creates an employee, the owner gives a temporary password. On first login, the employee must reset the password before accessing the system.

Security questions are added as an extra account recovery/security layer.

## Creates

```text
app/Models/SecurityQuestion.php
app/Models/UserSecurityQuestion.php

app/Http/Controllers/Auth/ForcePasswordResetController.php
app/Http/Controllers/SecurityQuestionController.php

app/Http/Requests/ForcePasswordResetRequest.php
app/Http/Requests/StoreSecurityQuestionRequest.php
app/Http/Requests/VerifySecurityQuestionRequest.php

app/Services/SecurityQuestionService.php
app/Services/PasswordSecurityService.php

app/Http/Middleware/EnsurePasswordIsNotTemporary.php

database/migrations/create_security_questions_table.php
database/migrations/create_user_security_questions_table.php
database/migrations/add_password_security_fields_to_users_table.php

database/seeders/SecurityQuestionSeeder.php

tests/Feature/PasswordSecurityTest.php
tests/Feature/SecurityQuestionTest.php

resources/js/pages/auth/force-password-reset.tsx
resources/js/pages/settings/security-questions.tsx
resources/js/components/forms/security-question-form.tsx
```

## Updates

```text
app/Models/User.php

app/Http/Controllers/Auth/RegisteredUserController.php
app/Http/Requests/RegisterRequest.php
app/Http/Requests/StoreCashierRequest.php
app/Http/Requests/StoreEmployeeRequest.php

app/Services/AuthService.php
app/Services/CashierService.php
app/Services/EmployeeService.php

routes/auth.php
routes/settings.php
routes/web.php

resources/js/pages/auth/register.tsx
resources/js/pages/cashiers/index.tsx
resources/js/pages/employees/index.tsx
resources/js/pages/settings/profile.tsx
resources/js/pages/settings/security.tsx
```

## Implements

```text
Strong password rules for owner signup
Temporary password flag for employees
Force password reset on first employee login
Password changed timestamp
Security questions
Security question setup page
Security question verification flow
Audit logs for password/security changes
```

## Strong Password Requirements

```text
Minimum 12 characters
Uppercase letter
Lowercase letter
Number
Symbol
Not commonly compromised
```

## User Fields To Add

```text
must_reset_password
password_changed_at
temporary_password_expires_at
```

## Workflow

```text
Owner creates employee
        ↓
Owner sets temporary password
        ↓
Employee logs in
        ↓
System detects must_reset_password = true
        ↓
Employee is redirected to reset password page
        ↓
Employee creates strong password
        ↓
must_reset_password becomes false
        ↓
Employee sets security question
        ↓
Employee can access allowed modules
```

---

# Phase 23: Business Verification Review And Resubmission

## Purpose

This phase makes business verification professional and traceable.

Currently approval is simple. This phase allows the super admin to review uploaded documents, reject with a reason, request resubmission, and track verification history.

## Creates

```text
app/Models/BusinessVerificationReview.php
app/Models/BusinessVerificationDocument.php

app/Enums/BusinessVerificationStatus.php
app/Enums/BusinessVerificationDocumentType.php

app/Http/Controllers/BusinessVerificationController.php
app/Http/Controllers/AdminBusinessVerificationController.php

app/Http/Requests/SubmitBusinessVerificationRequest.php
app/Http/Requests/ReviewBusinessVerificationRequest.php

app/Services/BusinessVerificationService.php

app/Policies/BusinessVerificationPolicy.php

app/Notifications/BusinessVerificationApprovedNotification.php
app/Notifications/BusinessVerificationRejectedNotification.php
app/Notifications/BusinessVerificationResubmissionRequestedNotification.php

database/migrations/create_business_verification_documents_table.php
database/migrations/create_business_verification_reviews_table.php

database/factories/BusinessVerificationDocumentFactory.php
database/factories/BusinessVerificationReviewFactory.php

tests/Feature/BusinessVerificationReviewTest.php

resources/js/pages/business/verification.tsx
resources/js/pages/admin/business-verifications/index.tsx
resources/js/pages/admin/business-verifications/show.tsx

resources/js/components/business-verification/document-viewer.tsx
resources/js/components/business-verification/review-timeline.tsx
resources/js/components/business-verification/review-action-form.tsx
resources/js/components/business-verification/verification-status-badge.tsx
```

## Updates

```text
app/Models/Business.php
app/Models/User.php

app/Http/Controllers/BusinessController.php
app/Http/Controllers/BusinessManagementController.php

app/Http/Requests/BusinessProfileRequest.php

app/Services/BusinessService.php
app/Services/RBACService.php
app/Services/DashboardService.php

app/Http/Middleware/EnsureBusinessIsApproved.php

routes/web.php

resources/js/pages/business/profile.tsx
resources/js/pages/admin/businesses/index.tsx
resources/js/components/forms/business-form.tsx
```

## Implements

```text
Document-by-document verification
Secure uploaded document viewing
Super admin review page
Approve verification
Reject verification with reason
Request resubmission
Owner resubmission flow
Verification timeline/history
Verification status badge
Owner notification after review
Audit logs for review actions
```

## Verification Statuses

```text
not_submitted
pending_review
approved
rejected
resubmission_required
```

## Workflow

```text
Owner submits verification documents
        ↓
Documents are stored as verification document records
        ↓
Business status becomes pending_review
        ↓
Super admin opens verification review page
        ↓
Super admin views each document
        ↓
Super admin approves, rejects, or requests resubmission
        ↓
System records review decision and reason
        ↓
Owner receives notification
        ↓
If approved, business becomes active
        ↓
If rejected or resubmission required, owner updates documents
```

---

