<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\VerifyPaymentRequest;
use App\Models\Payment;
use App\Models\Sale;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Payment::class);
        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        $search = $request->string('search')->toString();

        return Inertia::render('payments/index', [
            'payments' => $business ? $this->paymentService->paginateForBusiness($business, $search) : null,
            'sales' => $business ? Sale::query()
                ->where('business_id', $business->id)
                ->where('balance_due', '>', 0)
                ->latest('sold_at')
                ->take(50)
                ->get(['id', 'invoice_number', 'grand_total', 'paid_amount', 'balance_due', 'payment_status'])
                : [],
            'methods' => collect(PaymentMethod::cases())->map(fn (PaymentMethod $method): array => [
                'value' => $method->value,
                'label' => $method->label(),
            ])->values(),
            'filters' => ['search' => $search ?: null],
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $this->authorize('create', Payment::class);
        $business = $request->user()->ownedBusiness ?? $request->user()->business;

        abort_unless($business, 403);

        $payment = $this->paymentService->create($business, $request->user(), $request->validated());

        return to_route('payments.show', $payment)->with('success', 'Payment recorded.');
    }

    public function show(Payment $payment): Response
    {
        $this->authorize('view', $payment);

        return Inertia::render('payments/show', [
            'payment' => $payment->load(['sale', 'customer', 'user']),
            'verifyStatuses' => [
                ['value' => PaymentStatus::Completed->value, 'label' => PaymentStatus::Completed->label()],
                ['value' => PaymentStatus::Failed->value, 'label' => PaymentStatus::Failed->label()],
            ],
        ]);
    }

    public function verify(VerifyPaymentRequest $request, Payment $payment): RedirectResponse
    {
        $this->authorize('update', $payment);

        $payment = $this->paymentService->verify($payment, $request->user(), $request->validated());

        return to_route('payments.show', $payment)->with('success', 'Payment verification saved.');
    }
}
