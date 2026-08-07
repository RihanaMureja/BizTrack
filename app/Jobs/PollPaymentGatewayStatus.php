<?php

namespace App\Jobs;

use App\Models\Payment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class PollPaymentGatewayStatus implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly int $paymentId) {}

    public function handle(): void
    {
        Payment::query()->find($this->paymentId);
    }
}
