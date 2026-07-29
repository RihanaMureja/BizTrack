# BizTrack System Overview

## What BizTrack Is

BizTrack is a business management and POS system for small and medium businesses. It helps a business owner manage products, inventory, customers, cashiers, sales, payments, customer credit, expenses, reports, notifications, and audit logs from one system.

BizTrack is not a public shopping app. It is an internal business operations system used by business owners, cashiers, and platform administrators.

## Purpose

The purpose of BizTrack is to give each approved business a complete operating workspace where it can:

- Register and organize products.
- Track stock levels.
- Sell products through POS.
- Manage cashiers.
- Record customers.
- Track unpaid customer balances.
- Record payments.
- Track business expenses.
- Generate reports.
- Receive important alerts.
- Keep audit logs for accountability.

## Business Model

BizTrack works as a subscription-based SaaS system.

A business owner signs up, chooses a subscription plan, submits verification documents, and waits for approval. After approval, the owner can use the system based on the selected plan.

Subscription plans contain:

- Plan name.
- Price.
- Duration in months.
- Maximum allowed cashiers.
- Description.
- Active or inactive status.

The super admin manages subscription plans. Business owners can only select active plans.

## Roles

BizTrack has three main roles:

### Super Admin

The super admin manages the BizTrack platform itself.

The super admin can:

- View platform dashboard.
- View businesses.
- Approve businesses.
- Deactivate businesses.
- Manage business subscriptions.
- View users.
- Update users.
- View roles.
- View permissions.
- View audit logs.
- Manage subscription plans.

### Owner

The owner is the business owner. An owner belongs to one business workspace.

The owner can:

- Register a business profile.
- Submit verification documents.
- Select a subscription plan.
- Manage products.
- Manage categories.
- Manage inventory.
- Manage customers.
- Manage cashiers.
- Create and view sales.
- Record and view payments.
- Manage expenses.
- Generate reports.
- View notifications.
- View audit logs.
- Manage profile and settings.

Important: an owner cannot access the main system modules until the business is approved.

### Cashier

The cashier is created by the business owner and works inside that owner’s business.

The cashier can:

- View cashier dashboard.
- Use sales/POS.
- View sales.
- Manage customers.
- Record payments.
- View notifications.
- Update own profile.

The cashier cannot manage business profile, products, inventory, cashiers, subscriptions, expenses, reports, or admin features.

## Customer Logic

Customers are not login users in the current system. They are records inside a business.

A customer stores:

- Full name.
- Phone.
- Email.
- Address.
- Credit limit.
- Current balance.

Customers are used in sales and credit tracking.

When a sale is linked to a customer and the sale is unpaid or partially paid:

1. A customer credit record is created or updated.
2. The unpaid amount is stored as remaining balance.
3. The customer’s current balance is recalculated.
4. The credit can become unpaid, partial, completed, or overdue.
5. Credit reminders can be sent through notifications.

This means the customer module is connected to sales, payments, customer credit, reminders, and reports.

## RBAC And Permissions

RBAC means Role-Based Access Control.

In BizTrack, RBAC controls what each user can see and do based on their role.

The current roles are:

- `super_admin`
- `owner`
- `cashier`

Access control is handled through:

- Role enum.
- User role field.
- Role middleware.
- Business approval middleware.
- Policies.
- Route groups.
- Sidebar navigation from `RBACService`.

## Static Or Dynamic Permissions

Permissions are currently mostly static.

That means the actual access rules are defined in code through roles, middleware, route groups, and policies.

The app has role and permission pages, but the system does not yet work as a fully dynamic permission matrix where permissions are assigned from the database to each role.

Current behavior:

- Role-based access is active.
- Sidebar RBAC is active.
- Backend route protection is active.
- Business approval protection is active.
- Fully dynamic database-managed permissions can be expanded later.

## Sidebar RBAC

The sidebar changes based on the logged-in user’s role.

Sidebar visibility is controlled by `RBACService`.

### Super Admin Sidebar

- Dashboard: platform-level overview.
- Businesses: view, approve, deactivate, and manage business subscriptions.
- Users: view and manage users.
- Subscriptions: create, update, activate, and deactivate plans.
- Roles: view system roles.
- Permissions: view permission structure.
- Audit Logs: view platform activity.
- Settings: manage own profile/settings.

### Owner Sidebar

- Dashboard: business performance overview.
- Business Profile: business details, subscription, and verification documents.
- Products: product catalog.
- Categories: product grouping.
- Inventory: stock levels, restock, and adjustment.
- Customers: customer records and balances.
- Cashiers: staff accounts.
- Sales: sales records and POS activity.
- Payments: sale payment tracking.
- Expenses: business costs.
- Reports: generated summaries.
- Notifications: business alerts.
- Audit Logs: activity history.
- Settings: profile and account settings.

### Cashier Sidebar

- Dashboard: cashier activity overview.
- Sales: POS and sales records.
- Customers: customer records.
- Payments: record/view payments.
- Notifications: alerts.
- Profile: own account settings.

The sidebar is not the only security layer. Backend middleware and policies also protect the routes.

## Business Approval Workflow

1. A user creates an account.
2. The user becomes an owner by default.
3. The owner cannot access the main business modules yet.
4. The owner opens Business Profile.
5. The owner submits business details and verification documents.
6. The business status becomes `pending_review`.
7. The super admin opens the admin business management page.
8. The super admin reviews the business.
9. The super admin approves the business.
10. The business status becomes `active`.
11. The owner receives a business approval notification.
12. The owner can now access dashboard, products, inventory, sales, payments, reports, and other business modules.

Required verification fields:

- National ID FAN number.
- National ID photo.
- Business license / trade license.
- Tax certificate / TIN.

Conditional verification fields:

- VAT certificate: required only if the business is VAT registered.
- Rental agreement: required only if the business has a physical shop.

Business logo is managed through the business profile.

## Whole App Workflow

1. User registers or logs in.
2. Owner submits business profile and verification documents.
3. Super admin reviews and approves the business.
4. Owner creates categories.
5. Owner creates products.
6. Inventory records are created for products.
7. Owner restocks or adjusts inventory.
8. Owner creates customers.
9. Owner creates cashier accounts.
10. Owner or cashier creates sales through POS.
11. Sale reduces inventory automatically.
12. Low stock notifications are created when stock reaches reorder level.
13. Payments are recorded against sales.
14. Customer credit is created or updated when a customer sale is unpaid or partially paid.
15. Expenses are recorded under expense categories.
16. Reports summarize business activity.
17. Notifications alert users about important events.
18. Audit logs record important system activity.

## Subscription Workflow

1. Super admin creates subscription plans.
2. Active plans become available to business owners.
3. Owner selects a plan during business profile setup.
4. Business stores the selected `subscription_id`.
5. Super admin can update a business subscription.
6. Plan limits, such as maximum cashiers, are used to control business capacity.

Subscription status matters:

- Active subscriptions can be selected.
- Inactive subscriptions cannot be selected by owners.

## Database Tables

The database has 26 tables total.

They are split into:

- 17 BizTrack application tables.
- 9 Laravel/system tables.

## BizTrack Tables

These tables directly power the BizTrack business system.

### 1. `audit_logs`

Stores important system activity such as logins, logouts, business approvals, sales completed, and tracked data changes.

### 2. `businesses`

Stores business workspaces, owner relationship, subscription relationship, business profile, logo, status, and verification document paths.

### 3. `categories`

Stores product categories for each business.

### 4. `customers`

Stores customer records for each business, including contact details, credit limit, and current balance.

### 5. `customer_credits`

Tracks unpaid or partially paid customer sales, remaining balances, due dates, and overdue status.

### 6. `expenses`

Stores business expenses, including amount, date, vendor, receipt path, status, and notes.

### 7. `expense_categories`

Stores expense groups such as rent, salary, transport, utilities, and supplies.

### 8. `inventory`

Stores the current stock quantity and available stock for each product.

### 9. `inventory_transactions`

Stores stock movement history, including restocks, adjustments, and stock deductions from sales.

### 10. `notifications`

Stores in-app alerts such as low stock notifications, payment notifications, and customer credit reminders.

### 11. `payments`

Stores payments made against sales, including method, status, amount, reference, paid date, and verification date.

### 12. `products`

Stores product catalog data such as name, barcode, description, buy price, selling price, unit, reorder level, category, and status.

### 13. `reports`

Stores generated business report records, filters, summaries, and generated date.

### 14. `sales`

Stores sale header information such as invoice number, customer, cashier/owner, subtotal, tax, discount, grand total, payment status, and sale date.

### 15. `sale_items`

Stores the individual products sold inside each sale, including quantity, unit price, and line total.

### 16. `subscriptions`

Stores subscription plans, price, duration, maximum cashiers, description, and status.

### 17. `users`

Stores system users: super admins, business owners, and cashiers.

## Laravel/System Tables

These tables support Laravel, authentication, sessions, queues, cache, and migrations.

### 1. `cache`

Stores Laravel cached values.

### 2. `cache_locks`

Stores Laravel cache locks used to prevent conflicting processes.

### 3. `failed_jobs`

Stores queued jobs that failed.

### 4. `jobs`

Stores queued background jobs.

### 5. `job_batches`

Stores grouped job batch information.

### 6. `migrations`

Tracks which database migrations have already been run.

### 7. `passkeys`

Stores passkey/WebAuthn login credentials.

### 8. `password_reset_tokens`

Stores password reset tokens.

### 9. `sessions`

Stores logged-in browser session data.

