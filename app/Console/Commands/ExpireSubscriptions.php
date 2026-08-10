<?php

namespace App\Console\Commands;

use App\Enums\BusinessSubscriptionStatus;
use App\Models\Business;
use Illuminate\Console\Command;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire';

    protected $description = 'Mark business subscriptions that have passed their end date as expired.';

    public function handle(): int
    {
        $expired = Business::query()
            ->where('subscription_status', BusinessSubscriptionStatus::Active->value)
            ->whereNotNull('subscription_ends_at')
            ->where('subscription_ends_at', '<=', now())
            ->update(['subscription_status' => BusinessSubscriptionStatus::Expired->value]);

        $this->info("Expired {$expired} subscription(s).");

        return self::SUCCESS;
    }
}
