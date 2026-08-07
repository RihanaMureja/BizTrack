<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Http\Requests\StoreSaleRequest;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Services\SaleService;
use App\Services\CreditScoringService;
use App\Services\DiscountEngineService;
use App\Services\PaymentService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly SaleService $saleService,
        private readonly DiscountEngineService $discountEngineService,
        private readonly CreditScoringService $creditScoringService,
        private readonly PaymentService $paymentService,
    ) {}

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
                    ->get(['id', 'name', 'barcode', 'selling_price', 'unit'])
                : [],
            'business' => $business ? [
                'is_vat_registered' => (bool) $business->is_vat_registered,
                'vat_rate' => 15,
            ] : null,
            'customers' => $business
                ? Customer::query()
                    ->where('business_id', $business->id)
                    ->orderBy('display_name')
                    ->get(['id', 'display_name', 'business_id', 'credit_limit', 'current_balance'])
                    ->map(fn (Customer $customer): array => [
                        'id' => $customer->id,
                        'display_name' => $customer->display_name,
                        'discount' => $this->discountEngineService->previewForCustomer($customer),
                        'credit' => [
                            'suggested_limit' => (float) $this->creditScoringService->syncProfile($customer)->suggested_credit_limit,
                            'approved_limit' => (float) $customer->credit_limit,
                            'current_balance' => (float) $customer->current_balance,
                            'available_credit' => max(0, (float) $customer->credit_limit - (float) $customer->current_balance),
                        ],
                    ])
                : [],
        ]);
    }

    public function store(StoreSaleRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness ?? $request->user()->business;

        if (! $business) {
            return to_route('dashboard');
        }

        $this->authorize('create', Sale::class);
        $data = $request->validated();
        $sale = $this->saleService->create($business, $request->user(), $data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sale '.$sale->invoice_number.' sent to checkout.']);

        if (! empty($data['checkout_method']) && ! $sale->is_credit_sale) {
            $payment = $this->paymentService->createFromCheckout($sale, $request->user(), [
                'method' => $data['checkout_method'],
                'phone' => $data['checkout_phone'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            return to_route('payments.show', $payment);
        }

        return to_route('sales.index');
    }

    public function show(Sale $sale): Response
    {
        $this->authorize('view', $sale);

        return Inertia::render('sales/show', [
            'sale' => $sale->load(['customer', 'user', 'items.product']),
        ]);
    }
}
