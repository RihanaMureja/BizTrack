<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Events\InventoryLow;
use App\Models\Business;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
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
            ->with('user:id,name,role')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function restock(Inventory $inventory, int $quantity, ?string $notes, User $user): InventoryTransaction
    {
        return $this->change($inventory, InventoryTransactionType::Restock, $quantity, $notes, $user);
    }

    public function adjust(Inventory $inventory, InventoryTransactionType $type, int $quantity, ?string $notes, User $user): InventoryTransaction
    {
        return match ($type) {
            InventoryTransactionType::Adjustment => $this->setStock($inventory, $quantity, $notes, $user),
            InventoryTransactionType::Damaged => $this->change($inventory, InventoryTransactionType::Damaged, -$quantity, $notes, $user),
            InventoryTransactionType::Return => $this->change($inventory, InventoryTransactionType::Return, $quantity, $notes, $user),
            default => throw ValidationException::withMessages(['type' => 'Unsupported inventory adjustment type.']),
        };
    }

    protected function change(Inventory $inventory, InventoryTransactionType $type, int $delta, ?string $notes, User $user): InventoryTransaction
    {
        return DB::transaction(function () use ($inventory, $type, $delta, $notes, $user): InventoryTransaction {
            $locked = Inventory::query()->whereKey($inventory->id)->lockForUpdate()->firstOrFail();
            $before = (int) $locked->available_stock;
            $after = $before + $delta;

            if ($after < 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'Stock cannot go below zero.',
                ]);
            }

            return $this->record($locked, $type, $delta, $before, $after, $notes, $user);
        });
    }

    protected function setStock(Inventory $inventory, int $quantity, ?string $notes, User $user): InventoryTransaction
    {
        return DB::transaction(function () use ($inventory, $quantity, $notes, $user): InventoryTransaction {
            $locked = Inventory::query()->whereKey($inventory->id)->lockForUpdate()->firstOrFail();
            $before = (int) $locked->available_stock;
            $delta = $quantity - $before;

            return $this->record($locked, InventoryTransactionType::Adjustment, $delta, $before, $quantity, $notes, $user);
        });
    }

    protected function record(
        Inventory $inventory,
        InventoryTransactionType $type,
        int $delta,
        int $before,
        int $after,
        ?string $notes,
        User $user,
    ): InventoryTransaction {
        $inventory->forceFill([
            'quantity' => $after,
            'available_stock' => $after,
            'updated_at' => now(),
        ])->save();

        $transaction = InventoryTransaction::create([
            'inventory_id' => $inventory->id,
            'product_id' => $inventory->product_id,
            'business_id' => $inventory->product->business_id,
            'user_id' => $user->id,
            'type' => $type,
            'quantity_change' => $delta,
            'quantity_before' => $before,
            'quantity_after' => $after,
            'notes' => $notes,
        ]);

        $product = $inventory->product;

        if ($after <= $product->reorder_level) {
            InventoryLow::dispatch($inventory->refresh());
        }

        return $transaction;
    }
}
