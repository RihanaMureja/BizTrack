<?php

namespace App\Services\PaymentGateway;

use App\Enums\PaymentStatus;
use App\Models\Sale;

class TelebirrGatewayService implements PaymentGatewayInterface
{
    public function requestToPay(Sale $sale, float $amount, string $phone): array
    {
        $reference = 'TEL-'.$sale->id.'-'.now()->format('YmdHis');

        return [
            'status' => PaymentStatus::Pending->value,
            'reference' => $reference,
            'gateway_reference' => 'telebirr:'.$phone.':'.$reference,
            'message' => 'Telebirr request-to-pay initiated.',
        ];
    }
}
