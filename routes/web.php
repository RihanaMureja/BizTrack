<?php

use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::middleware('role:owner')->group(function () {
        Route::get('business/profile', [BusinessController::class, 'show'])->name('business.profile');
        Route::post('business/profile', [BusinessController::class, 'store'])->name('business.profile.store');
        Route::put('business/profile', [BusinessController::class, 'update'])->name('business.profile.update');
        Route::get('business/subscriptions', [SubscriptionController::class, 'index'])->name('business.subscriptions');

        Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
        Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);
        Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::post('inventory/{inventory}/restock', [InventoryController::class, 'restock'])->name('inventory.restock');
        Route::post('inventory/{inventory}/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');
        Route::get('inventory/{inventory}/transactions', [InventoryTransactionController::class, 'index'])->name('inventory.transactions.index');
        Route::post('cashiers/{cashier}/deactivate', [CashierController::class, 'deactivate'])->name('cashiers.deactivate');
        Route::post('cashiers/{cashier}/reset-password', [CashierController::class, 'resetPassword'])->name('cashiers.reset-password');
        Route::resource('cashiers', CashierController::class)
            ->except(['create', 'edit', 'show'])
            ->parameters(['cashiers' => 'cashier']);
    });

    Route::middleware('role:owner,cashier')->group(function () {
        Route::resource('customers', CustomerController::class)->except(['create', 'edit']);
        Route::get('sales/pos', [SaleController::class, 'create'])->name('sales.pos');
        Route::resource('sales', SaleController::class)->only(['index', 'store', 'show']);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
