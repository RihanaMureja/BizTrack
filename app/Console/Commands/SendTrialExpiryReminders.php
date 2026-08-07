<?php

namespace App\Console\Commands;

use App\Enums\BusinessAccessMode;
use App\Models\Business;
use App\Notifications\TrialExpiringNotification;
use Illuminate\Console\Command;

class SendTrialExpiryReminders extends Command
{
    protected $signature = 'trials:send-expiry-reminders {--days=3 : Send reminders for trials ending within this many days}';

    protected $description = 'Notify business owners before their BizTrack trial expires.';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $count = 0;

        Business::query()
            ->with('owner')
            ->where('access_mode', BusinessAccessMode::Trial)
            ->whereNotNull('trial_ends_at')
            ->whereNull('trial_expiry_notified_at')
            ->whereBetween('trial_ends_at', [now(), now()->addDays($days)])
            ->each(function (Business $business) use (&$count): void {
                if (! $business->owner) {
                    return;
                }

                $business->owner->notify(new TrialExpiringNotification($business));
                $business->forceFill(['trial_expiry_notified_at' => now()])->save();
                $count++;
            });

        $this->info("Sent {$count} trial expiry reminder(s).");

        return self::SUCCESS;
    }
}
