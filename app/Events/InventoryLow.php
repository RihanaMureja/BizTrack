<?php

namespace App\Events;

use App\Models\Inventory;
use Illuminate\Foundation\Events\Dispatchable;

class InventoryLow
{
    use Dispatchable;

    public function __construct(public readonly Inventory $inventory) {}
}
