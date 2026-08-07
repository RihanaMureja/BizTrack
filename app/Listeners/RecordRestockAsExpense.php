<?php

namespace App\Listeners;

use App\Events\InventoryBatchCreated;
use App\Models\User;
use App\Services\ExpenseAutomationService;

class RecordRestockAsExpense
{
    public function __construct(private readonly ExpenseAutomationService $expenseAutomationService) {}

    public function handle(InventoryBatchCreated $event): void
    {
        $this->expenseAutomationService->recordRestock(
            $event->batch,
            $event->userId ? User::find($event->userId) : null,
        );
    }
}
