<?php

namespace App\Http\Controllers;

use App\Http\Requests\InitiateCheckoutPaymentRequest;
use App\Models\Sale;
use App\Services\PaymentService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;

class CheckoutController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly PaymentService $paymentService) {}

    public function store(InitiateCheckoutPaymentRequest $request, Sale $sale): RedirectResponse
    {
        $this->authorize('view', $sale);

        $payment = $this->paymentService->createFromCheckout($sale, $request->user(), $request->validated());

        return to_route('payments.show', $payment)->with('success', 'Checkout payment started.');
    }
}
