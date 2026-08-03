<?php

namespace App\Http\Controllers;

use App\Enums\InventoryTransactionType;
use App\Http\Requests\RestockRequest;
use App\Http\Requests\StockAdjustmentRequest;
use App\Models\Inventory;
use App\Services\InventoryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly InventoryService $inventoryService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Inventory::class);

        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        $search = $request->string('search')->toString() ?: null;
        $status = $request->string('status')->toString() ?: null;

        return Inertia::render('inventory/index', [
            'inventory' => $business
                ? $this->inventoryService->paginateForBusiness($business, $search, $status)
                : null,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'adjustmentTypes' => collect([
                InventoryTransactionType::Adjustment,
                InventoryTransactionType::Damaged,
                InventoryTransactionType::Return,
            ])->map(fn (InventoryTransactionType $type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ])->values(),
        ]);
    }

    public function restock(RestockRequest $request, Inventory $inventory): RedirectResponse
    {
        $this->authorize('update', $inventory);

        $this->inventoryService->restock(
            $inventory,
            (int) $request->validated('quantity'),
            $request->validated('notes'),
            $request->user(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock restocked.']);

        return back();
    }

    public function adjust(StockAdjustmentRequest $request, Inventory $inventory): RedirectResponse
    {
        $this->authorize('update', $inventory);
        $data = $request->validated();

        $this->inventoryService->adjust(
            $inventory,
            InventoryTransactionType::from($data['type']),
            (int) $data['quantity'],
            $data['notes'] ?? null,
            $request->user(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock updated.']);

        return back();
    }
}
