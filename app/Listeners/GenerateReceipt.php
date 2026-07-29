<?php

namespace App\Listeners;

use App\Events\SaleCompleted;

class GenerateReceipt
{
    public function handle(SaleCompleted $event): void
    {
        // Receipt rendering will be expanded with printable templates.
    }
}
