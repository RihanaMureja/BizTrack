<?php

namespace App\Services\PaymentGateway;

use App\Enums\PaymentStatus;
use App\Models\Sale;

class CashPaymentHandler implements PaymentGatewayInterface
{
    public function requestToPay(Sale $sale, float $amount, string $phone = ''): array
    {
        $reference = 'CASH-'.$sale->id.'-'.now()->format('YmdHis');

        return [
            'status' => PaymentStatus::Completed->value,
            'reference' => $reference,
            'gateway_reference' => $reference,
            'message' => 'Cash payment confirmed.',
        ];
    }
}
