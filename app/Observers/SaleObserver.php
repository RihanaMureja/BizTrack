<?php

namespace App\Observers;

use App\Models\Sale;
use App\Services\AuditLogService;

class SaleObserver
{
    public function created(Sale $sale): void
    {
        app(AuditLogService::class)->log(
            action: 'sale.created',
            auditable: $sale,
            user: $sale->user,
            newValues: $sale->only(['invoice_number', 'customer_id', 'subtotal', 'grand_total', 'status', 'payment_status']),
        );
    }

    public function updated(Sale $sale): void
    {
        $changes = collect($sale->getChanges())->except(['updated_at'])->keys();

        if ($changes->isEmpty()) {
            return;
        }

        app(AuditLogService::class)->log(
            action: 'sale.updated',
            auditable: $sale,
            user: $sale->user,
            oldValues: $changes->mapWithKeys(fn (string $key): array => [$key => $sale->getOriginal($key)])->all(),
            newValues: $changes->mapWithKeys(fn (string $key): array => [$key => $sale->{$key}])->all(),
        );
    }
}
