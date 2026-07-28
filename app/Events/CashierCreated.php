<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;

class CashierCreated
{
    use Dispatchable;

    public function __construct(public readonly User $cashier) {}
}
