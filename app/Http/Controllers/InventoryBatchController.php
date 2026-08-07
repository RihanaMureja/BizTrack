<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Services\InventoryBatchService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Inertia\Response;

class InventoryBatchController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly InventoryBatchService $inventoryBatchService) {}

    public function index(Inventory $inventory): Response
    {
        $this->authorize('view', $inventory);

        return Inertia::render('inventory/batches', [
            'inventory' => $inventory->load('product.category'),
            'batches' => $this->inventoryBatchService->batchesForInventory($inventory),
        ]);
    }
}
