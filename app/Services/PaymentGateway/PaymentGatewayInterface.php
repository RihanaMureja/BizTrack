<?php

namespace App\Services\PaymentGateway;

use App\Models\Sale;

interface PaymentGatewayInterface
{
    /**
     * @return array{status: string, reference: string, gateway_reference: string, message: string}
     */
    public function requestToPay(Sale $sale, float $amount, string $phone): array;
}
