<?php

namespace App\Events;

use App\Models\InventoryBatch;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InventoryBatchCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly InventoryBatch $batch,
        public readonly ?int $userId = null,
    ) {}
}
