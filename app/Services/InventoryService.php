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
        private readonly ProductPricingService $productPricingService,
    ) {}

    public function paginateForBusiness(Business $business, ?string $search = null, ?string $status = null, int $perPage = 10): LengthAwarePaginator
    {
        return Inventory::query()
            ->with(['product.category', 'product.latestAvailableBatch', 'product.movementInsights'])
            ->whereHas('product', function ($query) use ($business, $search, $status): void {
                $query
                    ->where('business_id', $business->id)
                    ->when($search, function ($query) use ($search): void {
                        $query->where(function ($query) use ($search): void {
                            $query
                                ->where('name', 'like', '%' . $search . '%')
                                ->orWhere('barcode', 'like', '%' . $search . '%');
                        });
                    })
                    ->when($status === 'low', fn($query) => $query->whereColumn('products.reorder_level', '>=', 'inventory.available_stock'))
                    ->when($status === 'out', fn($query) => $query->where('inventory.available_stock', '<=', 0));
            })
            ->orderBy('available_stock')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (Inventory $inventory): Inventory {
                if ($inventory->product) {
                    $pricing = $this->productPricingService->priceFor($inventory->product);
                    $inventory->product->setAttribute('current_unit_cost', $pricing['unit_cost']);
                    $inventory->product->setAttribute('current_selling_price', $pricing['regular_price']);
                    $inventory->product->setAttribute('effective_selling_price', $pricing['effective_price']);
                    $inventory->product->setAttribute('is_discounted', $pricing['is_discounted']);
                    $inventory->product->setAttribute('active_discount', [
                        'price' => $pricing['discount_price'],
                        'percent' => $pricing['discount_percent'],
                        'reason' => $pricing['discount_reason'],
                        'allow_below_cost' => $pricing['allow_below_cost'],
                        'insight_id' => $pricing['insight_id'],
                    ]);
                }

                return $inventory;
            });
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
        ?float $sellingPrice = null,
    ): InventoryBatch {
        return $this->inventoryBatchService->restock($inventory, $quantity, $unitCost, $receivedAt, $expiryDate, $notes, $user, InventoryTransactionType::Restock, $sellingPrice);
    }

    public function adjust(Inventory $inventory, InventoryTransactionType $type, int $quantity, ?string $notes, User $user): void
    {
        match ($type) {
            InventoryTransactionType::Adjustment => $this->setStock($inventory, $quantity, $notes, $user),
            InventoryTransactionType::Damaged => $this->fifoStockAllocationService->deduct($inventory, $quantity, InventoryTransactionType::Damaged, $notes, $user),
            InventoryTransactionType::Return => $this->inventoryBatchService->restock($inventory, $quantity, $this->latestUnitCost($inventory), null, null, $notes, $user, InventoryTransactionType::Return, $this->latestSellingPrice($inventory)),
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
                    $this->latestUnitCost($locked),
                    null,
                    null,
                    $notes,
                    $user,
                    InventoryTransactionType::Adjustment,
                    $this->latestSellingPrice($locked),
                );

                return;
            }

            if ($delta < 0) {
                $this->fifoStockAllocationService->deduct($locked, abs($delta), InventoryTransactionType::Adjustment, $notes, $user);
            }
        });
    }

    private function latestUnitCost(Inventory $inventory): float
    {
        return (float) (InventoryBatch::query()
            ->where('product_id', $inventory->product_id)
            ->where('business_id', $inventory->product->business_id)
            ->latest('received_at')
            ->latest('id')
            ->value('unit_cost') ?? 0);
    }

    private function latestSellingPrice(Inventory $inventory): float
    {
        return (float) (InventoryBatch::query()
            ->where('product_id', $inventory->product_id)
            ->where('business_id', $inventory->product->business_id)
            ->latest('received_at')
            ->latest('id')
            ->value('selling_price') ?? 0);
    }
}
