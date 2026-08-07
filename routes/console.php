<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('products:detect-stagnant')->dailyAt('06:00');
Schedule::command('trials:send-expiry-reminders')->dailyAt('07:00');
Schedule::command('expenses:generate-payroll')->monthlyOn(28, '23:00');
