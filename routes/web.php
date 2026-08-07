<?php

use App\Http\Controllers\BusinessController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AdminSubscriptionController;
use App\Http\Controllers\BusinessManagementController;
use App\Http\Controllers\BusinessLogoController;
use App\Http\Controllers\BusinessVerificationDocumentController;
use App\Http\Controllers\BusinessRoleController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerCreditController;
use App\Http\Controllers\CreditDiscountController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryBatchController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Onboarding\OnboardingController;
use App\Http\Controllers\Onboarding\TrialActivationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentReceiptController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductCodeController;
use App\Http\Controllers\ProductReportController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('onboarding')->name('onboarding.')->middleware('role:owner')->group(function () {
        Route::get('/', [OnboardingController::class, 'index'])->name('index');
        Route::get('business-profile', [OnboardingController::class, 'businessProfile'])->name('business-profile');
        Route::post('business-profile', [OnboardingController::class, 'storeBusinessProfile'])->name('business-profile.store');
        Route::get('verify-phone', [OnboardingController::class, 'verifyPhone'])->name('verify-phone');
        Route::post('verify-phone/send', [OnboardingController::class, 'sendPhoneCode'])->name('verify-phone.send');
        Route::post('verify-phone/confirm', [OnboardingController::class, 'verifyPhoneCode'])->name('verify-phone.confirm');
        Route::get('choose-plan', [OnboardingController::class, 'choosePlan'])->name('choose-plan');
        Route::post('trial', [TrialActivationController::class, 'store'])->name('trial.store');
        Route::post('plans/{subscription}', [OnboardingController::class, 'activatePlan'])->name('plans.activate');
    });

    Route::get('businesses/{business}/logo', [BusinessLogoController::class, 'show'])
        ->name('businesses.logo');

    Route::get('business-verification-documents/{document}', [BusinessVerificationDocumentController::class, 'show'])
        ->name('business-verification-documents.show');

    Route::get('dashboard', DashboardController::class)
        ->middleware(['business.approved'])
        ->name('dashboard');
    Route::get('admin/audit-logs', [AuditLogController::class, 'index'])->middleware('role:super_admin,owner')->name('admin.audit-logs.index');

    Route::middleware('role:super_admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', SuperAdminController::class)->name('dashboard');
        Route::get('businesses', [BusinessManagementController::class, 'index'])->name('businesses.index');
        Route::put('businesses/{business}/subscription', [BusinessManagementController::class, 'updateSubscription'])->name('businesses.subscription.update');
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
        Route::put('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
        Route::post('subscriptions/{subscription}/activate', [AdminSubscriptionController::class, 'activate'])->name('subscriptions.activate');
        Route::post('subscriptions/{subscription}/deactivate', [AdminSubscriptionController::class, 'deactivate'])->name('subscriptions.deactivate');
        Route::resource('subscriptions', AdminSubscriptionController::class)->only(['index', 'store', 'update']);
        Route::resource('roles', RoleController::class)->only(['index']);
        Route::resource('permissions', PermissionController::class)->only(['index']);
    });

    Route::middleware('role:owner')->group(function () {
        Route::redirect('business/profile', '/settings/business')->name('business.profile');
        Route::get('business/subscriptions', [SubscriptionController::class, 'index'])->name('business.subscriptions');
    });

    Route::middleware(['role:owner,cashier', 'business.approved'])->group(function () {
        Route::middleware('business.permission:manage_categories')->group(function () {
            Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
        });

        Route::middleware('business.permission:manage_products')->group(function () {
            Route::get('products/{product}/label', [ProductCodeController::class, 'show'])->name('products.label');
            Route::post('product-insights/{productMovementInsight}/dismiss', [ProductController::class, 'dismissInsight'])->name('product-insights.dismiss');
            Route::post('product-insights/{productMovementInsight}/resolve', [ProductController::class, 'resolveInsight'])->name('product-insights.resolve');
            Route::resource('products', ProductController::class)->except(['create', 'edit']);
        });

        Route::middleware('business.permission:manage_inventory')->group(function () {
            Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
            Route::post('inventory/{inventory}/restock', [InventoryController::class, 'restock'])->name('inventory.restock');
            Route::post('inventory/{inventory}/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');
            Route::get('inventory/{inventory}/batches', [InventoryBatchController::class, 'index'])->name('inventory.batches.index');
            Route::get('inventory/{inventory}/transactions', [InventoryTransactionController::class, 'index'])->name('inventory.transactions.index');
        });

        Route::middleware('business.permission:manage_employees')->group(function () {
            Route::post('cashiers/{cashier}/deactivate', [CashierController::class, 'deactivate'])->name('cashiers.deactivate');
            Route::post('cashiers/{cashier}/reset-password', [CashierController::class, 'resetPassword'])->name('cashiers.reset-password');
            Route::resource('cashiers', CashierController::class)
                ->except(['create', 'edit', 'show'])
                ->parameters(['cashiers' => 'cashier']);
            Route::resource('business-roles', BusinessRoleController::class)
                ->except(['create', 'edit', 'show'])
                ->parameters(['business-roles' => 'businessRole']);
        });

        Route::middleware('business.permission:manage_expenses')->group(function () {
            Route::resource('expense-categories', ExpenseCategoryController::class)
                ->only(['store', 'update', 'destroy'])
                ->parameters(['expense-categories' => 'expenseCategory']);
            Route::resource('expenses', ExpenseController::class)->except(['create', 'edit', 'show']);
        });

        Route::middleware('business.permission:view_reports')->group(function () {
            Route::get('reports/products/{product}', [ProductReportController::class, 'show'])->name('reports.products.show');
            Route::resource('reports', ReportController::class)->only(['index', 'store']);
        });

        Route::middleware('business.permission:manage_customers')->group(function () {
            Route::resource('customers', CustomerController::class)->except(['create', 'edit']);
            Route::post('customer-credits/{customerCredit}/overdue', [CustomerCreditController::class, 'overdue'])->name('customer-credits.overdue');
            Route::post('customer-credits/{customerCredit}/remind', [CustomerCreditController::class, 'remind'])->name('customer-credits.remind');
        });

        Route::middleware('role:owner')->group(function () {
            Route::get('credit-discounts', [CreditDiscountController::class, 'index'])->name('credit-discounts.index');
            Route::post('credit-discounts/rules', [CreditDiscountController::class, 'store'])->name('credit-discounts.rules.store');
            Route::put('credit-discounts/rules/{discountRule}', [CreditDiscountController::class, 'update'])->name('credit-discounts.rules.update');
            Route::delete('credit-discounts/rules/{discountRule}', [CreditDiscountController::class, 'destroy'])->name('credit-discounts.rules.destroy');
            Route::put('credit-discounts/customers/{customer}/credit-limit', [CreditDiscountController::class, 'updateCreditLimit'])->name('credit-discounts.customers.credit-limit.update');
        });

        Route::get('sales/pos', [SaleController::class, 'create'])->middleware('business.permission:create_sales')->name('sales.pos');
        Route::post('sales', [SaleController::class, 'store'])->middleware('business.permission:create_sales')->name('sales.store');
        Route::post('sales/{sale}/checkout', [CheckoutController::class, 'store'])->middleware('business.permission:create_sales')->name('sales.checkout.store');
        Route::middleware('business.permission:view_sales')->group(function () {
            Route::resource('sales', SaleController::class)->only(['index', 'show']);
        });

        Route::middleware('business.permission:manage_payments')->group(function () {
            Route::post('payments/{payment}/verify', [PaymentController::class, 'verify'])->name('payments.verify');
            Route::get('payments/{payment}/receipt', [PaymentReceiptController::class, 'show'])->name('payments.receipt.show');
            Route::resource('payments', PaymentController::class)->only(['index', 'show']);
        });

        Route::middleware('business.permission:view_notifications')->group(function () {
            Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
            Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
            Route::resource('notifications', NotificationController::class)->only(['index']);
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
