<?php

namespace App\Listeners;

use App\Events\SaleCompleted;
use App\Services\AuditLogService;

class CreateAuditLog
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function handle(SaleCompleted $event): void
    {
        $this->auditLogService->record(
            'sale_completed',
            'sales',
            $event->sale->id,
            null,
            $event->sale->only(['invoice_number', 'grand_total', 'status']),
            $event->sale->user,
        );
    }
}
