<?php

namespace App\Services;

use App\Enums\RecordStatus;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Collection;

class SubscriptionService
{
    /**
     * @return Collection<int, Subscription>
     */
    public function activePlans(): Collection
    {
        return Subscription::query()
            ->where('status', RecordStatus::Active)
            ->orderBy('price')
            ->get();
    }

    public function defaultPlan(): ?Subscription
    {
        return $this->activePlans()->first();
    }
}
