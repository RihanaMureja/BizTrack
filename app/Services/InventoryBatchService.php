<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Events\InventoryBatchCreated;
use App\Events\InventoryLow;
use App\Models\Inventory;
use App\Models\InventoryBatch;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryBatchService
{
    public function batchesForInventory(Inventory $inventory, int $perPage = 15): LengthAwarePaginator
    {
        return InventoryBatch::query()
            ->where('product_id', $inventory->product_id)
            ->where('business_id', $inventory->product->business_id)
            ->orderByDesc('received_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function restock(
        Inventory $inventory,
        int $quantity,
        float $unitCost,
        ?string $receivedAt,
        ?string $expiryDate,
        ?string $notes,
        User $user,
        InventoryTransactionType $type = InventoryTransactionType::Restock,
    ): InventoryBatch {
        $batch = DB::transaction(function () use ($inventory, $quantity, $unitCost, $receivedAt, $expiryDate, $notes, $user, $type): InventoryBatch {
            $locked = Inventory::query()->with('product')->whereKey($inventory->id)->lockForUpdate()->firstOrFail();
            $product = $locked->product;
            $before = (int) $locked->available_stock;
            $after = $before + $quantity;

            $batch = InventoryBatch::create([
                'product_id' => $product->id,
                'business_id' => $product->business_id,
                'batch_number' => $this->nextBatchNumber($product),
                'quantity_received' => $quantity,
                'quantity_remaining' => $quantity,
                'unit_cost' => $unitCost,
                'received_at' => $receivedAt ? Carbon::parse($receivedAt) : now(),
                'expiry_date' => $expiryDate,
            ]);

            $this->saveInventorySummary($locked, $after);

            InventoryTransaction::create([
                'inventory_id' => $locked->id,
                'inventory_batch_id' => $batch->id,
                'product_id' => $product->id,
                'business_id' => $product->business_id,
                'user_id' => $user->id,
                'type' => $type,
                'quantity_change' => $quantity,
                'quantity_before' => $before,
                'quantity_after' => $after,
                'notes' => $notes,
            ]);

            if ($after <= $product->reorder_level) {
                InventoryLow::dispatch($locked->refresh());
            }

            return $batch;
        });

        InventoryBatchCreated::dispatch($batch->refresh(), $user->id);

        return $batch;
    }

    public function syncInventorySummary(Inventory $inventory): Inventory
    {
        $remaining = InventoryBatch::query()
            ->where('product_id', $inventory->product_id)
            ->sum('quantity_remaining');

        return $this->saveInventorySummary($inventory, (int) $remaining);
    }

    private function saveInventorySummary(Inventory $inventory, int $stock): Inventory
    {
        $inventory->forceFill([
            'quantity' => $stock,
            'available_stock' => $stock,
            'updated_at' => now(),
        ])->save();

        return $inventory;
    }

    private function nextBatchNumber(Product $product): string
    {
        $prefix = 'B'.$product->business_id.'-P'.$product->id.'-'.now()->format('Ymd').'-';
        $next = InventoryBatch::query()
            ->where('business_id', $product->business_id)
            ->where('batch_number', 'like', $prefix.'%')
            ->count() + 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}
