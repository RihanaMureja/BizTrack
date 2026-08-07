# BizTrack — Agent Execution Plan (Phase 24–37)

## Role

You are a senior full-stack engineer working inside the existing BizTrack codebase
(Laravel 13 + Inertia.js + React 19/TypeScript, layered Controller → Form Request →
Service → Model, Eloquent Policies for authorization, `RBACService` for
permission-driven navigation). You are picking up an existing project — do not
scaffold a new app, do not change the framework, and do not restructure conventions
that already exist in the repo.

## Execution Rules

1. **Work through the phases below in numeric order (24 → 37).** Do not start a
   later phase until every item in the current phase's "Definition Of Done" is
   satisfied. Later phases assume earlier ones are already merged.
2. **Do not skip, merge, or reorder phases** unless explicitly told to. If a phase
   turns out to depend on something not yet built, stop and flag it rather than
   improvising scope.
3. For every phase: first read the **Files To Remove** and **Files To Update**
   lists and open/inspect those files before writing anything, so new code matches
   existing naming, typing, and validation patterns already in the file.
4. **Match existing conventions exactly**: PHP 8.3 typed properties, Laravel Form
   Request validation (not inline validation in controllers), Eloquent
   `#[Fillable([...])]` attributes, Inertia page components in
   `resources/js/pages/**`, shared UI in `resources/js/components/**`, Tailwind
   utility classes (or CSS custom properties where a phase says so), and existing
   test conventions under `tests/Feature/**`.
5. **Write or update tests for every new behavior.** A phase is not complete
   without its listed test files passing.
6. **Do not leave dead code.** When a file is listed under "Files To Remove,"
   delete it and remove every reference to it (routes, nav entries, imports,
   service bindings) — do not just stop calling it.
7. When a phase note says a decision was made on the user's behalf (free trial
   gate, FIFO batch consumption, etc.), implement it exactly as specified — do not
   substitute an alternative approach without flagging it first.
8. After finishing each phase, run the project's existing test suite and confirm
   no previously-passing test regresses before moving to the next phase.

---

## Phase 24: Landing Page Simplification And Single Auth Entry Point

### Task

Remove the duplicate top-level call to action on the landing page. Currently it
shows both "Log In" and "Create Account" as equal-weight buttons, which is
redundant since sign-up is reachable from the login screen. Change the landing
page so it has a single primary action — **Log In**. Move sign-up into a secondary
link inside the login page ("Don't have an account? Create one"). Do not leave a
top-level "Create Account" button anywhere on the landing page.

### Files To Update

```text
resources/js/pages/welcome.tsx
resources/js/pages/auth/login.tsx
resources/js/pages/auth/register.tsx
resources/js/components/auth/auth-card-layout.tsx
routes/web.php
```

### Definition Of Done

```text
[ ] Landing page renders exactly one primary call to action: "Log In"
[ ] Sign-up is reachable only as a secondary link inside the login page
[ ] No route or component still renders a competing top-level "Create Account" button
[ ] Entry point is consistent regardless of how a visitor arrives (direct link, marketing, email)
```

---

## Phase 25: Guided Owner Onboarding — Business Setup, Subscription Plans, And Free Trial

### Task

Replace the current post-signup behavior — where the owner lands on
`/business/profile` **inside the full application shell** (sidebar, nav, everything
visible but non-functional) — with a dedicated, sidebar-free onboarding flow the
owner cannot leave until it is complete.

**Do not implement any super admin verification/approval gate.** A business that
has already paid for a plan cannot then be told its account is on hold because a
document didn't pass review — that contradicts the business model. Build this
phase with no `pending_review` state, no admin approve/reject action, and no
suspension tied to document review. Treat National ID, trade license, TIN, VAT
certificate, and rental agreement as **optional** uploads on the business profile —
never required, never blocking, never reviewed by an admin.

Make account access a pure function of **payment/trial status**: once the owner
selects a plan and pays (or starts a free trial), set the business to `active`
(or `trial`) immediately. Convert the super admin's "Businesses" screen from an
approval queue into a **read-only directory** — implement no approve/reject actions
on it at all.

Gate the free trial on **phone number OTP verification only** — build this as the
sole anti-abuse check, reusable later by the mobile-payment work in Phase 33. Do
not add any other trial gate (no card capture, no document requirement).

Sequence the onboarding steps as: (1) business profile form first, (2) plan
selection second — the plan screen needs business size (cashier count) to
recommend a tier, and neither step should depend on any review process.

Build the plan-selection screen to match the reference pricing design supplied
separately: three plan cards, each with a headline, sub-copy, price, "Get Started"
button, and a feature checklist, with a free-trial call to action placed above the
cards.

### Files To Remove

```text
app/Http/Controllers/AdminBusinessVerificationController.php
app/Http/Requests/ReviewBusinessVerificationRequest.php
app/Services/BusinessVerificationService.php    (review/approve/reject logic removed;
                                                   optional document storage moves into
                                                   BusinessProfileService instead)

resources/js/pages/admin/business-verifications/   (approval queue UI)

database/migrations/drop_business_verification_review_columns.php
                                                 (drops submitted_for_review_at and any
                                                  approved_at/rejected_at/rejection_reason
                                                  columns on businesses)
```

### Files To Create

```text
app/Http/Controllers/Onboarding/OnboardingController.php
app/Http/Controllers/Onboarding/TrialActivationController.php

app/Http/Requests/StartTrialRequest.php
app/Http/Requests/VerifyOwnerPhoneRequest.php

app/Services/OnboardingService.php
app/Services/PhoneOtpService.php

app/Enums/OnboardingStep.php
app/Enums/BusinessAccessMode.php

app/Http/Middleware/EnsureOnboardingComplete.php

database/migrations/add_onboarding_fields_to_businesses_table.php
database/migrations/create_phone_verifications_table.php

app/Notifications/TrialStartedNotification.php
app/Notifications/TrialExpiringNotification.php

tests/Feature/OnboardingFlowTest.php
tests/Feature/TrialActivationTest.php

resources/js/layouts/onboarding-layout.tsx
resources/js/pages/onboarding/business-profile.tsx
resources/js/pages/onboarding/verify-phone.tsx
resources/js/pages/onboarding/choose-plan.tsx
resources/js/components/onboarding/plan-card.tsx
resources/js/components/onboarding/onboarding-progress.tsx
```

### Files To Update

```text
app/Models/Business.php
app/Models/Subscription.php

app/Http/Controllers/BusinessController.php
app/Http/Controllers/SubscriptionController.php
app/Http/Controllers/AdminBusinessVerificationController.php  → repurpose into a
                                                                  read-only admin
                                                                  business directory
                                                                  (list/show only)

app/Http/Requests/BusinessProfileRequest.php   (make national_id_photo, trade_license,
                                                 tin_certificate, vat_certificate, and
                                                 rental_agreement all nullable — remove
                                                 every required/required_if rule on them)

app/Services/BusinessService.php
app/Services/SubscriptionService.php
app/Services/RBACService.php

routes/web.php

resources/js/pages/business/profile.tsx
resources/js/pages/admin/businesses/index.tsx   (remove approval actions, render a
                                                  read-only list with status = active/
                                                  trial/suspended only)
resources/js/middleware/redirect-if-onboarding-incomplete.tsx
```

### Implement These Business Access Modes

```text
onboarding   — profile/plan not yet completed, sidebar-free wizard only
trial        — full functional access, gated only by phone OTP, no document review
active       — paid plan in good standing
suspended    — trial expired without payment, or subscription lapsed/cancelled
```

### Build This Exact Workflow

```text
Owner registers
        ↓
Redirect to onboarding layout (no sidebar, no dashboard)
        ↓
Step 1: Business profile submitted — verification documents optional, not required
        ↓
Step 2: Choose a plan — "Start 14-Day Free Trial" or "Get Started" on a paid plan
        ↓
If trial: phone number OTP verification → access mode becomes trial, full app unlocked
If paid: payment completes → access mode becomes active, full app unlocked
        ↓
No admin review step — implement nothing pending, nothing rejectable
        ↓
On trial expiry without payment → suspended, prompt to choose a paid plan
```

### Definition Of Done

```text
[ ] Sidebar-free onboarding layout exists and cannot be bypassed before completion
[ ] Business profile is step 1; every verification document field is optional
[ ] Plan selection screen matches the pricing-card reference design
[ ] Free trial is gated only by phone OTP — no document review, no admin approval step
[ ] Access mode is driven purely by payment/trial status, never by document review
[ ] Super admin business list has zero approve/reject actions
[ ] Trial-expiring reminder notification fires before expiry
```

---

## Phase 26: Navigation Cleanup — Single Settings Entry Point

### Task

Fix two navigation problems in the same pass. First, "Settings" currently appears
both as a sidebar item and inside the user/logout menu — remove it from the
sidebar and keep only the user/logout menu entry. Second, now that onboarding
(Phase 25) exists, remove **Business Profile** from the top-level sidebar entirely
and move it into Settings as a tab, alongside Profile, Security, and Preferences.

### Files To Update

```text
app/Services/RBACService.php

resources/js/components/app-sidebar.tsx
resources/js/components/nav-main.tsx
resources/js/components/nav-user.tsx

resources/js/pages/settings/profile.tsx
resources/js/pages/settings/business.tsx
resources/js/layouts/settings/layout.tsx

routes/settings.php
routes/web.php
```

### Definition Of Done

```text
[ ] Settings is reachable only from the user/logout menu, not from the main sidebar
[ ] Business Profile lives under Settings → Business tab, not the main sidebar
[ ] Main sidebar contains only functional, day-to-day modules
```

---

## Phase 27: Unified Product Module — Card Catalog With Embedded Performance

### Task

Merge Products and Product Insights into a single **Products** module — one sidebar
item, one controller, one service, one page. Remove the current dual-view pattern
where the same product data is shown both as a table and as a separate "recent
products" card rail; that is two indexes over one source of truth and it invites
drift. Replace both with **one card grid** that includes search, category
filtering, sorting, and server-side pagination, so the card view scales to
catalogs with hundreds of SKUs without needing a second table view. Make every
card clickable to open the edit form. Embed a small inline sparkline inside each
card showing units sold over the last 30 days, so performance is visible without
opening the product. Move the fuller insight view (stagnant-product detection,
suggested actions, trend charts) into an expandable section inside the product
detail page — do not keep it as a separate top-level page.

### Files To Create

```text
app/Http/Controllers/ProductController.php  (absorb insight endpoints into this controller)

resources/js/pages/products/index.tsx        (card grid, replaces table + rail)
resources/js/pages/products/show.tsx         (expanded product detail + full insight view)
resources/js/components/products/product-card.tsx
resources/js/components/products/product-card-sparkline.tsx
resources/js/components/products/product-filters-bar.tsx
resources/js/components/products/product-form-modal.tsx

tests/Feature/ProductCatalogViewTest.php
```

### Files To Update

```text
app/Http/Controllers/ProductInsightController.php   (merge into ProductController, then delete)
app/Services/ProductService.php
app/Services/ProductInsightService.php               (merge into ProductService)

app/Services/RBACService.php   (remove the separate "Product Insights" nav entry)

routes/web.php

resources/js/pages/products/insights.tsx              (delete — fold into index/show)
resources/js/components/dashboard/stagnant-products-card.tsx
```

### Definition Of Done

```text
[ ] Products module is a single nav item, controller, service, and page
[ ] Only a card view exists for the catalog — no parallel table view remains
[ ] Search, category filter, and pagination operate on the card grid, same data source
[ ] Every card is clickable and opens the edit form
[ ] Each card renders an inline 30-day sales sparkline
[ ] Full insight (stagnant detection, suggested action) is reachable inside product detail
```

---

## Phase 28: Automatic Product Code Generation (Barcode + QR)

### Task

Remove the manual barcode input field from the product form entirely. On product
creation, generate a unique product code automatically — implement **both** a
scannable Code128 barcode (for POS hardware) and a QR code encoding the product
reference (for phone-camera stock-taking and small-item labels). Do not require
the owner to type or edit a barcode value. Once a barcode has been referenced by a
sale, do not allow it to be regenerated or changed.

### Files To Create

```text
app/Services/ProductCodeGeneratorService.php

app/Http/Controllers/ProductCodeController.php   (renders/downloads printable labels)

database/migrations/add_qr_payload_to_products_table.php

tests/Feature/ProductCodeGenerationTest.php

resources/js/components/products/product-code-preview.tsx
resources/js/components/products/printable-label.tsx
```

### Files To Update

```text
app/Models/Product.php
app/Services/ProductService.php
app/Http/Requests/ProductRequest.php   (remove the barcode input field, mark it system-generated)

resources/js/components/products/product-form-modal.tsx
resources/js/components/products/product-card.tsx
```

### Definition Of Done

```text
[ ] Barcode input field is fully removed from the product form
[ ] Barcode is auto-generated on creation, business-prefixed, collision-checked
[ ] QR code is auto-generated encoding the product reference
[ ] A printable label (barcode + QR + name + price) is available per product
[ ] Barcode is immutable once any sale references the product
```

---

## Phase 29: Batch And Lot-Based Inventory Tracking

### Task

Replace the single running-quantity inventory model with **batches (lots)**. On
every restock, create a new batch with its own quantity and unit cost — do not
just increment one shared quantity field. Sales must consume the **oldest batch
first (FIFO)**. Make the product's total available stock a computed sum across its
open batches, not a manually-adjusted number. Build a view where the owner can see
exactly how much of each batch has sold and how much remains.

### Files To Create

```text
app/Models/InventoryBatch.php

app/Http/Controllers/InventoryBatchController.php

app/Http/Requests/StoreInventoryBatchRequest.php

app/Services/InventoryBatchService.php
app/Services/FifoStockAllocationService.php

database/migrations/create_inventory_batches_table.php
database/migrations/add_batch_id_to_inventory_transactions_table.php

database/factories/InventoryBatchFactory.php

tests/Feature/InventoryBatchTest.php
tests/Feature/FifoStockAllocationTest.php

resources/js/pages/inventory/batches.tsx
resources/js/components/inventory/batch-breakdown-table.tsx
resources/js/components/inventory/restock-batch-form.tsx
```

### Files To Update

```text
app/Models/Inventory.php               (turn into a computed rollup over batches)
app/Models/InventoryTransaction.php
app/Models/Product.php

app/Http/Controllers/InventoryController.php
app/Services/InventoryService.php

app/Http/Requests/RestockRequest.php

resources/js/pages/inventory/index.tsx
resources/js/components/products/product-card.tsx   (show batch-aware available stock)
```

### Implement These Batch Fields

```text
batch_number
quantity_received
quantity_remaining
unit_cost
received_at
expiry_date (optional, for perishable/pharmacy-type inventory)
```

### Build This Exact Workflow

```text
Owner restocks a product
        ↓
Create a new InventoryBatch with quantity + unit cost for that restock
        ↓
Compute the product's available stock as the sum of quantity_remaining across open batches
        ↓
A sale is made
        ↓
FifoStockAllocationService deducts from the oldest batch(es) first
        ↓
Update batch quantity_remaining; record which batch was drawn from on the InventoryTransaction
        ↓
Show batch #, received date, cost, sold, remaining per batch on the product detail page
```

### Definition Of Done

```text
[ ] Every restock creates a batch/lot record, never just increments a single number
[ ] Sales consume stock FIFO, oldest batch first
[ ] Per-batch cost is tracked and queryable (required as input to Phase 36 reporting)
[ ] A batch-level remaining-stock breakdown view exists per product
[ ] Expiry date is supported as an optional per-batch field
```

---

## Phase 30: System-Wide Validation Hardening

### Task

Fix the specific gap where a category currently allows two products with the
identical name, and while you are in the validation layer, audit and fix the
related gaps listed below — do not scope this down to only the product-name fix,
since the phases before this one introduce new required-field logic (customer
types, batches, discounts) that needs the same scrutiny.

### Files To Update

```text
app/Http/Requests/ProductRequest.php
app/Http/Requests/CustomerRequest.php
app/Http/Requests/StoreInventoryBatchRequest.php
app/Http/Requests/StoreSaleRequest.php
app/Http/Requests/BusinessProfileRequest.php

tests/Feature/ProductValidationTest.php
tests/Feature/CustomerValidationTest.php
```

### Fix Each Of These Validation Gaps

```text
Product: name is currently unique only against barcode collision, not against
         (business_id, category_id, name)
         → add composite uniqueness so the same name can exist in different
           categories, but never twice within the same category

Customer: credit_limit/current_balance are currently freely editable on every save
          with no floor tied to actual outstanding balance
          → derive current_balance from CustomerCredit records instead of accepting
            it as free input (this feeds directly into Phase 32)

Sale: discount_amount currently has no upper-bound check against subtotal
      → add an lte:subtotal rule

Inventory restock: no rule currently prevents a negative or zero quantity_received
      → add a min:1 rule on batch quantity

Business profile: VAT/rental documents are conditionally required via required_if,
                   but the conditional boolean fields themselves have no explicit
                   boolean rule before the required_if check runs
                   → add explicit boolean casting/validation before the conditional
                     requirement is evaluated
```

### Definition Of Done

```text
[ ] Product name is unique per (business, category) — duplicate names across
    categories are still allowed
[ ] Customer balance fields are derived from source-of-truth records, not freely editable
[ ] Sale discount_amount cannot exceed subtotal
[ ] Restock quantity_received cannot be zero or negative
[ ] Business profile conditional document requirements are validated correctly
```

---

## Phase 31: Flexible Customer Identity

### Task

Stop assuming every customer is a person. Add a customer type and adjust which
fields are required per type — a company needs a legal/trade name plus a contact
person, a government office needs an office/department name plus a contact person,
an individual just needs a name. Migrate every existing customer record to
`individual` using their existing `full_name` value — do not lose any existing
data in this migration.

### Files To Create

```text
app/Enums/CustomerType.php

database/migrations/add_customer_type_fields_to_customers_table.php

tests/Feature/CustomerTypeTest.php

resources/js/components/customers/customer-type-fields.tsx
```

### Files To Update

```text
app/Models/Customer.php
app/Http/Requests/CustomerRequest.php
app/Services/CustomerService.php

resources/js/pages/customers/index.tsx
resources/js/components/forms/customer-form.tsx
```

### Implement These Customer Types And Fields

```text
individual   → display_name (person's full name)
company      → display_name (legal/trade name) + contact_person + contact_person_phone
government   → display_name (office/department name) + contact_person
other        → display_name + optional contact_person
```

### Definition Of Done

```text
[ ] Customer type selector exists on both create and edit forms
[ ] Conditional fields render correctly per type (contact person for company/government)
[ ] Every existing customer record is migrated to individual with zero data loss
[ ] display_name is used consistently across sales, receipts, and reports for every type
```

---

## Phase 32: Unified Credit Limit And Discount Engine

### Task

Merge credit limits and discounts into a single sidebar module — **Credit &
Discounts** — since both represent the same underlying decision from the owner's
point of view. Build owner-defined tiered discount rules (e.g. "spend 5,000 birr
in a month → 5% off"). Stop treating credit_limit as a number the owner types once
— compute a **system-suggested** credit limit from actual purchase history (total
volume, payment punctuality sourced from `CustomerCredit`, tenure), but always keep
an owner override available; do not make the number fully automatic with no
override, since that removes trust from owners managing real money.

### Files To Create

```text
app/Models/DiscountRule.php
app/Models/CustomerCreditProfile.php

app/Http/Controllers/CreditDiscountController.php

app/Http/Requests/StoreDiscountRuleRequest.php

app/Services/DiscountEngineService.php
app/Services/CreditScoringService.php

database/migrations/create_discount_rules_table.php
database/migrations/create_customer_credit_profiles_table.php

database/factories/DiscountRuleFactory.php

tests/Feature/DiscountEngineTest.php
tests/Feature/CreditScoringTest.php

resources/js/pages/credit-discounts/index.tsx
resources/js/components/credit-discounts/discount-rule-form.tsx
resources/js/components/credit-discounts/credit-suggestion-card.tsx
```

### Files To Update

```text
app/Models/Customer.php
app/Services/CustomerCreditService.php
app/Services/RBACService.php   (add the new "Credit & Discounts" sidebar entry)
app/Services/SaleService.php   (apply the matching discount rule automatically at sale time)

app/Http/Requests/CustomerRequest.php   (credit_limit becomes a suggested default with optional override)

routes/web.php

resources/js/pages/sales/create.tsx   (show the applied discount from the matching rule)
```

### Use These Credit Scoring Inputs

```text
Total historical purchase volume
On-time payment rate (from CustomerCredit due_date vs paid_at)
Average order value
Customer tenure (first sale to today)
```

### Definition Of Done

```text
[ ] Owner-defined tiered discount rules exist (spend threshold → discount %)
[ ] Discounts apply automatically at point of sale when a customer qualifies
[ ] Credit limit is system-suggested from real purchase/payment behavior
[ ] Owner override is available on both discount rules and credit limits
[ ] "Credit & Discounts" is a single sidebar module replacing the previously scattered logic
```

---

## Phase 33: Sales Checkout And Automated Payment Collection

### Task

Replace the "Complete Sale" button with "Proceed to Payment," which opens a
payment modal. Remove the standalone Payments module's manual "create payment"
form entirely — a payment must be a record of something that happened during
checkout, never a second place to retype numbers. Wire checkout directly into a
mobile-money collection flow (Telebirr request-to-pay by phone number), built
behind a swappable gateway interface so other providers can be added later without
touching checkout logic. Convert the Payments page into **read-only history**,
auto-populated by checkout — do not leave any way to manually create a payment
record from that page.

### Files To Create

```text
app/Services/PaymentGateway/PaymentGatewayInterface.php
app/Services/PaymentGateway/TelebirrGatewayService.php
app/Services/PaymentGateway/CashPaymentHandler.php

app/Http/Controllers/CheckoutController.php

app/Http/Requests/InitiateCheckoutPaymentRequest.php

database/migrations/add_gateway_reference_to_payments_table.php

app/Jobs/PollPaymentGatewayStatus.php

tests/Feature/CheckoutPaymentTest.php
tests/Feature/TelebirrGatewayTest.php

resources/js/components/sales/proceed-to-payment-modal.tsx
resources/js/components/sales/payment-method-selector.tsx
resources/js/components/sales/payment-status-poller.tsx
```

### Files To Update

```text
app/Http/Controllers/SaleController.php
app/Http/Controllers/PaymentController.php   (keep index/show only — remove create/store)
app/Services/SaleService.php
app/Services/PaymentService.php

app/Models/Payment.php

app/Http/Requests/StoreSaleRequest.php

routes/web.php

resources/js/pages/sales/create.tsx
resources/js/pages/payments/index.tsx        (convert to a history/ledger view)
resources/js/pages/payments/create.tsx        (delete)
```

### Build This Exact Workflow

```text
Cashier builds the sale (items, customer, discount auto-applied from Phase 32)
        ↓
Cashier clicks "Proceed to Payment"
        ↓
Modal opens: cash, or mobile money (customer's phone number)
        ↓
If mobile money: send request-to-pay to Telebirr, poll status
        ↓
On confirmed payment, create the Payment record automatically, mark the sale paid
        ↓
If cash: record payment immediately on confirmation tap, no separate form
        ↓
Generate the receipt, sale complete
```

### Definition Of Done

```text
[ ] "Proceed to Payment" replaces "Complete Sale" everywhere in the sales UI
[ ] Checkout payment modal supports cash and mobile money
[ ] Telebirr request-to-pay works behind a swappable gateway interface
[ ] No manual "create payment" screen exists anywhere — payments are only ever auto-created
[ ] Payments module is read-only history/ledger, fully auditable
```

---

## Phase 34: Automated Expense Generation

### Task

Stop requiring manual entry for expenses the system already knows about. When a
product is restocked (Phase 29 batch created), automatically generate an expense
entry for that restock's cost (quantity × unit cost) — do not require the owner to
type it in separately. Generate payroll expenses automatically on a monthly
schedule from each active employee's salary. Leave manual entry in place only for
costs the system has no trigger for — utilities, rent, one-off purchases.

### Files To Create

```text
app/Listeners/RecordRestockAsExpense.php
app/Listeners/RecordPayrollAsExpense.php

app/Console/Commands/GenerateMonthlyPayrollExpenses.php

app/Services/ExpenseAutomationService.php

database/migrations/add_salary_to_users_table.php
database/migrations/add_source_type_to_expenses_table.php

app/Enums/ExpenseSource.php

tests/Feature/AutoExpenseFromRestockTest.php
tests/Feature/PayrollExpenseGenerationTest.php

resources/js/components/expenses/auto-generated-badge.tsx
```

### Files To Update

```text
app/Models/Expense.php
app/Models/User.php                      (add a salary field for employees)
app/Services/InventoryBatchService.php   (fire a restock event)
app/Services/ExpenseService.php

app/Http/Controllers/ExpenseController.php
app/Http/Requests/UpdateCashierRequest.php   (add salary field on employee edit)

routes/console.php

resources/js/pages/expenses/index.tsx
resources/js/pages/cashiers/index.tsx    (add salary field)
```

### Implement These Expense Sources

```text
manual     — owner-entered (utilities, rent, one-off costs)
restock    — auto-generated from InventoryBatch creation
payroll    — auto-generated monthly from active employee salaries
```

### Build This Exact Workflow

```text
Owner restocks a product (creates a batch)
        ↓
RecordRestockAsExpense listener fires
        ↓
Create an expense: amount = quantity_received × unit_cost, source = restock
        ↓
--- separately, on a monthly schedule ---
        ↓
GenerateMonthlyPayrollExpenses command runs
        ↓
Create one expense per active employee with a salary set, source = payroll
        ↓
Leave manual entry available for utilities, rent, and other irregular costs
```

### Definition Of Done

```text
[ ] Every restock auto-generates a linked expense entry
[ ] Employee records support a salary field
[ ] Monthly payroll expense generation runs on schedule
[ ] Manual entry still works for non-systemic costs
[ ] Every expense is tagged with its source (manual/restock/payroll) and filterable in reports
```

---

## Phase 35: Service Fee Decommissioning

### Task

Remove the platform service fee feature entirely — models, controllers, services,
UI, and every reference to it. Do this only after Phase 33 is complete, because
service fees currently calculate off payment completion, and that hook must be
detached safely before checkout logic changes further.

### Files To Remove

```text
app/Models/ServiceFee.php
app/Models/ServiceFeeSetting.php

app/Http/Controllers/ServiceFeeController.php
app/Http/Controllers/AdminServiceFeeController.php

app/Services/ServiceFeeService.php

resources/js/pages/service-fees/
resources/js/pages/admin/service-fees/

database/migrations/drop_service_fees_tables.php
```

### Files To Update

```text
app/Services/PaymentService.php   (remove the service-fee-on-payment hook)
app/Services/RBACService.php      (remove "Service Fees" nav entries, both admin and owner)
app/Services/SubscriptionService.php   (remove any fee-based revenue reporting references)

routes/web.php

resources/js/components/app-sidebar.tsx
```

### Definition Of Done

```text
[ ] No ServiceFee model, controller, service, route, or page remains anywhere in the codebase
[ ] Payment completion no longer triggers any fee calculation
[ ] Subscriptions are the only revenue mechanism left in the system
[ ] No "Service Fees" nav item remains for either Super Admin or Owner
```

---

## Phase 36: Advanced Reporting And Product-Level Analytics

### Task

Extend the reports module with product-specific, graphical views: profit by
product and sales trend by product. Use real per-batch cost data from Phase 29 for
profit calculations instead of an averaged buy price. Make the reporting surface
graphical throughout, not table-first, and support drill-down from the general
report into a specific product's detail.

### Files To Create

```text
app/Http/Controllers/ProductReportController.php

app/Services/ProductReportService.php

resources/js/pages/reports/products.tsx
resources/js/components/reports/profit-by-product-chart.tsx
resources/js/components/reports/sales-trend-chart.tsx
resources/js/components/reports/report-filter-bar.tsx

tests/Feature/ProductReportTest.php
```

### Files To Update

```text
app/Http/Controllers/ReportController.php
app/Services/ReportService.php

routes/web.php

resources/js/pages/reports/index.tsx
```

### Definition Of Done

```text
[ ] Profit-by-product report uses real batch cost data, not averaged buy price
[ ] Sales trend by product renders graphically (line/bar via recharts)
[ ] Reports are filterable by category and date range
[ ] The general report links to drill-down detail for a specific product
```

---

## Phase 37: Dynamic Multi-Tenant Theming — Business Categories And Logo-Driven Palettes

### Task

Implement two combined features, and build them last since every module they touch
(products, sales, dashboard, reports) must already exist in final form. First,
**business category**: let a retail shop and a perfume boutique see dashboard
emphasis and terminology suited to their kind of business. Second, **logo-driven
color theming**: pull buttons, active states, and accents from the business's
uploaded logo instead of one fixed brand color.

For palette extraction: use k-means color quantization on the uploaded logo,
reduce the result to a small token set (primary, secondary, accent), then run each
color through a contrast check against white/near-black text. If the extracted
primary fails accessibility contrast, fall back to a darkened/lightened variant of
that same color — never fall back to a generic brand color, and never ship a
palette that fails contrast. This requires migrating the frontend to consume CSS
custom properties instead of hardcoded Tailwind color classes — treat this as the
largest single engineering task in this phase and budget accordingly; do not
underscope it.

### Files To Create

```text
app/Models/BusinessTheme.php

app/Enums/BusinessCategory.php

app/Http/Controllers/BusinessThemeController.php

app/Services/LogoColorExtractionService.php
app/Services/ThemeTokenService.php
app/Services/ContrastCheckerService.php

database/migrations/create_business_themes_table.php
database/migrations/add_category_to_businesses_table.php

tests/Feature/LogoColorExtractionTest.php
tests/Feature/ThemeTokenGenerationTest.php

resources/js/hooks/use-business-theme.tsx
resources/js/components/theme/theme-provider.tsx
resources/js/pages/settings/appearance.tsx   (extend with a live palette preview)
```

### Files To Update

```text
app/Models/Business.php
app/Services/BusinessService.php
app/Http/Controllers/BusinessLogoController.php

app/Services/DashboardService.php   (category-aware widget selection)

resources/css/app.css                          (convert to CSS custom properties)
resources/js/components/ui/button.tsx           (consume theme tokens)
resources/js/components/app-sidebar.tsx
resources/js/layouts/app/app-sidebar-layout.tsx
resources/js/pages/dashboard.tsx                (category-aware widgets)
```

### Implement This Initial Business Category Set

```text
retail
pharmacy
perfume_and_cosmetics
restaurant_and_food
electronics
general
```

### Build This Exact Workflow

```text
Owner uploads logo during onboarding (Phase 25) or later in Settings
        ↓
LogoColorExtractionService quantizes the image into dominant colors
        ↓
ContrastCheckerService validates/adjusts each color for accessible contrast
        ↓
ThemeTokenService writes primary/secondary/accent tokens for the business
        ↓
Frontend ThemeProvider injects tokens as CSS custom properties at runtime
        ↓
Buttons, active nav states, and chart accents render in the business's own colors
        ↓
Business category (set during onboarding) adjusts dashboard widget selection and
module copy — e.g. pharmacy surfaces batch expiry warnings prominently, perfume/
retail surfaces stock and sell-through instead
```

### Definition Of Done

```text
[ ] Business category is selectable during onboarding
[ ] Color palette is automatically extracted from the uploaded logo
[ ] Extracted colors that fail contrast are automatically adjusted, never shipped as-is
[ ] The whole UI is driven by CSS custom properties, not fixed brand colors
[ ] Dashboard widget selection is category-aware
[ ] Settings → Appearance shows a live palette preview
```

---
