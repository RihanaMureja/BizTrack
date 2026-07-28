<?php

namespace App\Listeners;

use App\Events\SaleCompleted;

class CalculateRevenue
{
    public function handle(SaleCompleted $event): void
    {
        // Revenue summaries are query-based for now.
    }
}
