<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Events\InventoryLow;
use App\Models\Inventory;
use App\Models\InventoryBatch;
use App\Models\InventoryTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FifoStockAllocationService
{
    public function deduct(
        Inventory $inventory,
        int $quantity,
        InventoryTransactionType $type,
        ?string $notes,
        User $user,
    ): void {
        DB::transaction(function () use ($inventory, $quantity, $type, $notes, $user): void {
            $locked = Inventory::query()->with('product')->whereKey($inventory->id)->lockForUpdate()->firstOrFail();
            $product = $locked->product;

            if ((int) $locked->available_stock < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => 'Stock cannot go below zero.',
                    'items' => $product->name.' does not have enough stock.',
                ]);
            }

            $batches = InventoryBatch::query()
                ->where('product_id', $product->id)
                ->where('business_id', $product->business_id)
                ->where('quantity_remaining', '>', 0)
                ->orderByRaw('received_at is null')
                ->orderBy('received_at')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            if ($batches->sum('quantity_remaining') < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => 'Available batch stock is not enough for this action.',
                    'items' => $product->name.' does not have enough batch stock.',
                ]);
            }

            $remaining = $quantity;
            $runningBefore = (int) $locked->available_stock;

            foreach ($batches as $batch) {
                if ($remaining <= 0) {
                    break;
                }

                $consume = min($remaining, (int) $batch->quantity_remaining);
                $runningAfter = $runningBefore - $consume;

                $batch->forceFill([
                    'quantity_remaining' => (int) $batch->quantity_remaining - $consume,
                ])->save();

                InventoryTransaction::create([
                    'inventory_id' => $locked->id,
                    'inventory_batch_id' => $batch->id,
                    'product_id' => $product->id,
                    'business_id' => $product->business_id,
                    'user_id' => $user->id,
                    'type' => $type,
                    'quantity_change' => -$consume,
                    'quantity_before' => $runningBefore,
                    'quantity_after' => $runningAfter,
                    'notes' => $notes,
                ]);

                $runningBefore = $runningAfter;
                $remaining -= $consume;
            }

            $locked->forceFill([
                'quantity' => $runningBefore,
                'available_stock' => $runningBefore,
                'updated_at' => now(),
            ])->save();

            if ($runningBefore <= $product->reorder_level) {
                InventoryLow::dispatch($locked->refresh());
            }
        });
    }
}
