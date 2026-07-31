<?php

namespace App\Providers;

use App\Events\BusinessRegistered;
use App\Events\InventoryLow;
use App\Events\PaymentCompleted;
use App\Events\SaleCompleted;
use App\Listeners\CalculateRevenue;
use App\Listeners\CreateAuditLog;
use App\Listeners\GenerateReceipt;
use App\Listeners\SendLowStockNotification;
use App\Listeners\SendPaymentNotification;
use App\Listeners\UpdateInventory;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Expense;
use App\Models\Sale;
use App\Observers\ExpenseObserver;
use App\Observers\PaymentObserver;
use App\Observers\ProductObserver;
use App\Observers\SaleObserver;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerEvents();
        $this->configureDefaults();
    }

    protected function registerEvents(): void
    {
        Event::listen(BusinessRegistered::class, CreateAuditLog::class);

        Event::listen(
            InventoryLow::class,
            SendLowStockNotification::class,
        );

        Event::listen(SaleCompleted::class, UpdateInventory::class);
        Event::listen(SaleCompleted::class, GenerateReceipt::class);
        Event::listen(SaleCompleted::class, CalculateRevenue::class);
        Event::listen(SaleCompleted::class, CreateAuditLog::class);
        Event::listen(PaymentCompleted::class, SendPaymentNotification::class);

        Product::observe(ProductObserver::class);
        Payment::observe(PaymentObserver::class);
        Expense::observe(ExpenseObserver::class);
        Sale::observe(SaleObserver::class);
        Event::listen(Login::class, CreateAuditLog::class);
        Event::listen(Logout::class, CreateAuditLog::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): Password => tap(
            Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols(),
            fn (Password $password) => app()->isProduction() ? $password->uncompromised() : null,
        ));
    }
}
