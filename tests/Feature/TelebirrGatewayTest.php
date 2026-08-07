<?php

use App\Enums\PaymentStatus;
use App\Models\Sale;
use App\Services\PaymentGateway\PaymentGatewayInterface;
use App\Services\PaymentGateway\TelebirrGatewayService;

test('telebirr request to pay is behind payment gateway interface', function () {
    $gateway = app(TelebirrGatewayService::class);
    $sale = Sale::factory()->create();

    expect($gateway)->toBeInstanceOf(PaymentGatewayInterface::class);

    $result = $gateway->requestToPay($sale, 250, '0911222333');

    expect($result['status'])->toBe(PaymentStatus::Pending->value)
        ->and($result['reference'])->toStartWith('TEL-'.$sale->id)
        ->and($result['gateway_reference'])->toContain('telebirr:0911222333');
});
