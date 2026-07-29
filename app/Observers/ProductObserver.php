<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\AuditLogService;

class ProductObserver
{
    public function created(Product $product): void
    {
        $product->inventory()->firstOrCreate([], [
            'quantity' => 0,
            'available_stock' => 0,
            'updated_at' => now(),
        ]);

        app(AuditLogService::class)->log(
            action: 'product.created',
            auditable: $product,
            newValues: $product->only(['name', 'barcode', 'buy_price', 'selling_price', 'unit', 'reorder_level', 'status']),
        );
    }

    public function updated(Product $product): void
    {
        $changes = collect($product->getChanges())->except(['updated_at'])->keys();

        if ($changes->isEmpty()) {
            return;
        }

        app(AuditLogService::class)->log(
            action: 'product.updated',
            auditable: $product,
            oldValues: $changes->mapWithKeys(fn (string $key): array => [$key => $product->getOriginal($key)])->all(),
            newValues: $changes->mapWithKeys(fn (string $key): array => [$key => $product->{$key}])->all(),
        );
    }

    public function deleted(Product $product): void
    {
        app(AuditLogService::class)->log(
            action: 'product.deleted',
            auditable: $product,
            oldValues: $product->only(['name', 'barcode', 'status']),
        );
    }
}
