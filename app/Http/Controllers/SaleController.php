<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Http\Requests\CheckoutSaleRequest;
use App\Http\Requests\StoreSaleRequest;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly SaleService $saleService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Sale::class);
        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        $search = $request->string('search')->toString() ?: null;

        return Inertia::render('sales/index', [
            'sales' => $business ? $this->saleService->paginateForBusiness($business, $search) : null,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Sale::class);
        $business = $request->user()->ownedBusiness ?? $request->user()->business;

        return Inertia::render('sales/pos', [
            'products' => $business
                ? Product::query()
                    ->with('inventory')
                    ->where('business_id', $business->id)
                    ->where('status', RecordStatus::Active)
                    ->orderBy('name')
                    ->get(['id', 'name', 'barcode', 'selling_price'])
                : [],
            'customers' => $business
                ? Customer::query()->where('business_id', $business->id)->orderBy('full_name')->get(['id', 'full_name'])
                : [],
        ]);
    }

    public function checkoutPage(Request $request): Response
    {
        $this->authorize('create', Sale::class);
        $business = $request->user()->ownedBusiness ?? $request->user()->business;

        return Inertia::render('sales/checkout', [
            'products' => $business ? Product::query()->with('inventory')->where('business_id', $business->id)->where('status', RecordStatus::Active)->get(['id', 'name', 'barcode', 'selling_price']) : [],
            'customers' => $business ? Customer::query()->where('business_id', $business->id)->orderBy('full_name')->get(['id', 'full_name', 'current_balance', 'credit_limit', 'default_discount', 'customer_type']) : [],
            'canOverrideDiscount' => $request->user()->isOwner(),
        ]);
    }

    public function store(StoreSaleRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness ?? $request->user()->business;

        if (! $business) {
            return to_route('dashboard');
        }

        $this->authorize('create', Sale::class);
        $sale = $this->saleService->create($business, $request->user(), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sale '.$sale->invoice_number.' completed.']);

        return to_route('sales.index');
    }

    public function checkout(CheckoutSaleRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness ?? $request->user()->business;

        if (! $business) {
            return to_route('dashboard');
        }

        $this->authorize('create', Sale::class);
        $result = $this->saleService->checkout($business, $request->user(), $request->validated());
        $sale = $result['sale'];

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sale '.$sale->invoice_number.' and payment recorded.']);

        return to_route('sales.show', $sale);
    }

    public function show(Sale $sale): Response
    {
        $this->authorize('view', $sale);

        return Inertia::render('sales/show', [
            'sale' => $sale->load(['customer', 'user', 'items.product']),
        ]);
    }
}
