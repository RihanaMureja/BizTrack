<?php

namespace App\Listeners;

use App\Events\SaleCompleted;

class UpdateInventory
{
    public function handle(SaleCompleted $event): void
    {
        // Inventory is reduced inside SaleService transaction.
    }
}
