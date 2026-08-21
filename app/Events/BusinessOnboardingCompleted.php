<?php

namespace App\Events;

use App\Enums\BusinessAccessMode;
use App\Models\Business;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BusinessOnboardingCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Business $business,
        public readonly BusinessAccessMode $accessMode,
    ) {}
}
