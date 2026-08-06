<?php

use App\Http\Controllers\BusinessController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AdminSubscriptionController;
use App\Http\Controllers\AdminBusinessVerificationController;
use App\Http\Controllers\BusinessManagementController;
use App\Http\Controllers\BusinessLogoController;
use App\Http\Controllers\BusinessVerificationDocumentController;
use App\Http\Controllers\BusinessRoleController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerCreditController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductInsightController;
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
        Route::post('businesses/{business}/approve', [BusinessManagementController::class, 'approve'])->name('businesses.approve');
        Route::post('businesses/{business}/deactivate', [BusinessManagementController::class, 'deactivate'])->name('businesses.deactivate');
        Route::put('businesses/{business}/subscription', [BusinessManagementController::class, 'updateSubscription'])->name('businesses.subscription.update');
        Route::get('business-verifications/{business}', [AdminBusinessVerificationController::class, 'show'])->name('business-verifications.show');
        Route::post('business-verifications/{business}/review', [AdminBusinessVerificationController::class, 'review'])->name('business-verifications.review');
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
        Route::put('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
        Route::post('subscriptions/{subscription}/activate', [AdminSubscriptionController::class, 'activate'])->name('subscriptions.activate');
        Route::post('subscriptions/{subscription}/deactivate', [AdminSubscriptionController::class, 'deactivate'])->name('subscriptions.deactivate');
        Route::resource('subscriptions', AdminSubscriptionController::class)->only(['index', 'store', 'update']);
        Route::resource('roles', RoleController::class)->only(['index']);
        Route::resource('permissions', PermissionController::class)->only(['index']);
    });

    Route::middleware('role:owner')->group(function () {
        Route::get('business/profile', [BusinessController::class, 'show'])->name('business.profile');
        Route::post('business/profile', [BusinessController::class, 'store'])->name('business.profile.store');
        Route::put('business/profile', [BusinessController::class, 'update'])->name('business.profile.update');
        Route::get('business/subscriptions', [SubscriptionController::class, 'index'])->name('business.subscriptions');
    });

    Route::middleware(['role:owner,cashier', 'business.approved'])->group(function () {
        Route::middleware('business.permission:manage_categories')->group(function () {
            Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
        });

        Route::middleware('business.permission:manage_products')->group(function () {
            Route::get('products/insights', [ProductInsightController::class, 'index'])->name('products.insights');
            Route::post('product-insights/{productMovementInsight}/dismiss', [ProductInsightController::class, 'dismiss'])->name('product-insights.dismiss');
            Route::post('product-insights/{productMovementInsight}/resolve', [ProductInsightController::class, 'resolve'])->name('product-insights.resolve');
            Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);
        });

        Route::middleware('business.permission:manage_inventory')->group(function () {
            Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
            Route::post('inventory/{inventory}/restock', [InventoryController::class, 'restock'])->name('inventory.restock');
            Route::post('inventory/{inventory}/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');
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
            Route::resource('reports', ReportController::class)->only(['index', 'store']);
        });

        Route::middleware('business.permission:manage_customers')->group(function () {
            Route::resource('customers', CustomerController::class)->except(['create', 'edit']);
            Route::post('customer-credits/{customerCredit}/overdue', [CustomerCreditController::class, 'overdue'])->name('customer-credits.overdue');
            Route::post('customer-credits/{customerCredit}/remind', [CustomerCreditController::class, 'remind'])->name('customer-credits.remind');
        });

        Route::get('sales/pos', [SaleController::class, 'create'])->middleware('business.permission:create_sales')->name('sales.pos');
        Route::get('sales/checkout', [SaleController::class, 'checkoutPage'])->middleware('business.permission:create_sales')->name('sales.checkout.page');
        Route::post('sales', [SaleController::class, 'store'])->middleware('business.permission:create_sales')->name('sales.store');
        Route::post('sales/checkout', [SaleController::class, 'checkout'])->middleware('business.permission:create_sales')->name('sales.checkout');
        Route::middleware('business.permission:view_sales')->group(function () {
            Route::resource('sales', SaleController::class)->only(['index', 'show']);
        });

        Route::middleware('business.permission:manage_payments')->group(function () {
            Route::post('payments/{payment}/verify', [PaymentController::class, 'verify'])->name('payments.verify');
            Route::resource('payments', PaymentController::class)->only(['index', 'store', 'show']);
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
