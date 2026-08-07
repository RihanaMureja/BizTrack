<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\PaymentReceiptService;
use Illuminate\Http\JsonResponse;

class PaymentReceiptController extends Controller
{
    public function __construct(private readonly PaymentReceiptService $paymentReceiptService) {}

    public function show(Payment $payment): JsonResponse
    {
        $this->authorize('view', $payment);

        return response()->json($this->paymentReceiptService->details($payment));
    }
}
