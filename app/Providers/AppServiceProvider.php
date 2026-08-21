<?php

namespace App\Providers;

use App\Events\BusinessRegistered;
use App\Events\BusinessOnboardingCompleted;
use App\Events\BusinessSubscriptionChanged;
use App\Events\InventoryLow;
use App\Events\InventoryBatchCreated;
use App\Events\PaymentCompleted;
use App\Events\SaleCompleted;
use App\Listeners\CalculateRevenue;
use App\Listeners\CreateAuditLog;
use App\Listeners\GenerateReceipt;
use App\Listeners\NotifySuperAdminsOfBusinessOnboardingCompleted;
use App\Listeners\NotifySuperAdminsOfBusinessRegistered;
use App\Listeners\NotifySuperAdminsOfEmailVerification;
use App\Listeners\NotifySuperAdminsOfPaymentCompleted;
use App\Listeners\NotifySuperAdminsOfSubscriptionChanged;
use App\Listeners\NotifySuperAdminsOfUserSignup;
use App\Listeners\RecordRestockAsExpense;
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
use App\Services\SystemHealthService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Events\ScheduledTaskFailed;
use Illuminate\Console\Events\ScheduledTaskFinished;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
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
        Event::listen(BusinessRegistered::class, NotifySuperAdminsOfBusinessRegistered::class);
        Event::listen(BusinessOnboardingCompleted::class, NotifySuperAdminsOfBusinessOnboardingCompleted::class);
        Event::listen(BusinessSubscriptionChanged::class, NotifySuperAdminsOfSubscriptionChanged::class);

        Event::listen(
            InventoryLow::class,
            SendLowStockNotification::class,
        );
        Event::listen(InventoryBatchCreated::class, RecordRestockAsExpense::class);

        Event::listen(SaleCompleted::class, UpdateInventory::class);
        Event::listen(SaleCompleted::class, GenerateReceipt::class);
        Event::listen(SaleCompleted::class, CalculateRevenue::class);
        Event::listen(SaleCompleted::class, CreateAuditLog::class);
        Event::listen(PaymentCompleted::class, SendPaymentNotification::class);
        Event::listen(PaymentCompleted::class, NotifySuperAdminsOfPaymentCompleted::class);

        Product::observe(ProductObserver::class);
        Payment::observe(PaymentObserver::class);
        Expense::observe(ExpenseObserver::class);
        Sale::observe(SaleObserver::class);
        Event::listen(Registered::class, NotifySuperAdminsOfUserSignup::class);
        Event::listen(Verified::class, NotifySuperAdminsOfEmailVerification::class);
        Event::listen(Login::class, CreateAuditLog::class);
        Event::listen(Logout::class, CreateAuditLog::class);
        Event::listen(ScheduledTaskFinished::class, fn (ScheduledTaskFinished $event) => app(SystemHealthService::class)->recordSuccessfulScheduleRun());
        Event::listen(ScheduledTaskFailed::class, fn (ScheduledTaskFailed $event) => app(SystemHealthService::class)->recordFailedScheduleRun($event->task->description ?: ($event->task->command ?? 'scheduled task')));
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
