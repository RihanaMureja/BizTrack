<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Services\InventoryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Inertia\Response;

class InventoryTransactionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly InventoryService $inventoryService) {}

    public function index(Inventory $inventory): Response
    {
        $this->authorize('view', $inventory);

        return Inertia::render('inventory/history', [
            'inventory' => $inventory->load('product.category'),
            'transactions' => $this->inventoryService->transactionsForInventory($inventory),
        ]);
    }
}
