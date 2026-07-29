<?php

namespace App\Providers;

use App\Events\BusinessRegistered;
use App\Events\InventoryLow;
use App\Events\SaleCompleted;
use App\Listeners\CalculateRevenue;
use App\Listeners\CreateAuditLog;
use App\Listeners\GenerateReceipt;
use App\Listeners\SendBusinessApprovedNotification;
use App\Listeners\SendLowStockNotification;
use App\Listeners\UpdateInventory;
use App\Models\Product;
use App\Observers\ProductObserver;
use Carbon\CarbonImmutable;
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
        Event::listen(
            BusinessRegistered::class,
            SendBusinessApprovedNotification::class,
        );

        Event::listen(
            InventoryLow::class,
            SendLowStockNotification::class,
        );

        Event::listen(SaleCompleted::class, UpdateInventory::class);
        Event::listen(SaleCompleted::class, GenerateReceipt::class);
        Event::listen(SaleCompleted::class, CalculateRevenue::class);
        Event::listen(SaleCompleted::class, CreateAuditLog::class);

        Product::observe(ProductObserver::class);
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

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
