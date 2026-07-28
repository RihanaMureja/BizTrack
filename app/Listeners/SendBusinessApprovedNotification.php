<?php

namespace App\Listeners;

use App\Events\BusinessRegistered;
use App\Notifications\BusinessApprovedNotification;

class SendBusinessApprovedNotification
{
    public function handle(BusinessRegistered $event): void
    {
        $owner = $event->business->owner;

        if (! $owner) {
            return;
        }

        $owner->notify(new BusinessApprovedNotification($event->business));
    }
}
