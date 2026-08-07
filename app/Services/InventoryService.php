<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Models\Business;
use App\Models\Inventory;
use App\Models\InventoryBatch;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public function __construct(
        private readonly InventoryBatchService $inventoryBatchService,
        private readonly FifoStockAllocationService $fifoStockAllocationService,
    ) {}

    public function paginateForBusiness(Business $business, ?string $search = null, ?string $status = null, int $perPage = 10): LengthAwarePaginator
    {
        return Inventory::query()
            ->with(['product.category'])
            ->whereHas('product', function ($query) use ($business, $search, $status): void {
                $query
                    ->where('business_id', $business->id)
                    ->when($search, function ($query) use ($search): void {
                        $query->where(function ($query) use ($search): void {
                            $query
                                ->where('name', 'like', '%'.$search.'%')
                                ->orWhere('barcode', 'like', '%'.$search.'%');
                        });
                    })
                    ->when($status === 'low', fn ($query) => $query->whereColumn('products.reorder_level', '>=', 'inventory.available_stock'))
                    ->when($status === 'out', fn ($query) => $query->where('inventory.available_stock', '<=', 0));
            })
            ->orderBy('available_stock')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function transactionsForInventory(Inventory $inventory, int $perPage = 15): LengthAwarePaginator
    {
        return $inventory
            ->transactions()
            ->with(['user:id,name,role', 'batch:id,batch_number,unit_cost'])
            ->latest()
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
    ): InventoryBatch
    {
        return $this->inventoryBatchService->restock($inventory, $quantity, $unitCost, $receivedAt, $expiryDate, $notes, $user);
    }

    public function adjust(Inventory $inventory, InventoryTransactionType $type, int $quantity, ?string $notes, User $user): void
    {
        match ($type) {
            InventoryTransactionType::Adjustment => $this->setStock($inventory, $quantity, $notes, $user),
            InventoryTransactionType::Damaged => $this->fifoStockAllocationService->deduct($inventory, $quantity, InventoryTransactionType::Damaged, $notes, $user),
            InventoryTransactionType::Return => $this->inventoryBatchService->restock($inventory, $quantity, (float) $inventory->product->buy_price, null, null, $notes, $user, InventoryTransactionType::Return),
            default => throw ValidationException::withMessages(['type' => 'Unsupported inventory adjustment type.']),
        };
    }

    protected function setStock(Inventory $inventory, int $quantity, ?string $notes, User $user): void
    {
        DB::transaction(function () use ($inventory, $quantity, $notes, $user): void {
            $locked = Inventory::query()->with('product')->whereKey($inventory->id)->lockForUpdate()->firstOrFail();
            $before = (int) $locked->available_stock;
            $delta = $quantity - $before;

            if ($delta > 0) {
                $this->inventoryBatchService->restock(
                    $locked,
                    $delta,
                    (float) $locked->product->buy_price,
                    null,
                    null,
                    $notes,
                    $user,
                    InventoryTransactionType::Adjustment,
                );

                return;
            }

            if ($delta < 0) {
                $this->fifoStockAllocationService->deduct($locked, abs($delta), InventoryTransactionType::Adjustment, $notes, $user);
            }
        });
    }
}
