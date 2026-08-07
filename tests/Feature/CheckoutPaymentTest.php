<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\User;

function checkoutPaymentContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();
    $sale = Sale::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'grand_total' => 500,
        'paid_amount' => 0,
        'balance_due' => 500,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    return [$owner, $business, $sale];
}

test('checkout cash payment creates completed payment automatically', function () {
    [$owner, , $sale] = checkoutPaymentContext();

    $this->actingAs($owner)
        ->post(route('sales.checkout.store', $sale), [
            'method' => PaymentMethod::Cash->value,
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();

    expect($payment->method)->toBe(PaymentMethod::Cash)
        ->and($payment->status)->toBe(PaymentStatus::Completed)
        ->and((float) $payment->amount)->toBe(500.0)
        ->and((float) $sale->refresh()->balance_due)->toBe(0.0);
});

test('checkout mobile money creates pending telebirr payment automatically', function () {
    [$owner, , $sale] = checkoutPaymentContext();

    $this->actingAs($owner)
        ->post(route('sales.checkout.store', $sale), [
            'method' => PaymentMethod::Telebirr->value,
            'phone' => '0911222333',
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();

    expect($payment->method)->toBe(PaymentMethod::Telebirr)
        ->and($payment->status)->toBe(PaymentStatus::Pending)
        ->and($payment->gateway_reference)->toContain('telebirr:0911222333')
        ->and((float) $sale->refresh()->paid_amount)->toBe(0.0);
});

test('manual payment creation route is not registered', function () {
    [$owner, , $sale] = checkoutPaymentContext();

    $this->actingAs($owner)
        ->post('/payments', [
            'sale_id' => $sale->id,
            'amount' => 100,
            'method' => PaymentMethod::Cash->value,
        ])
        ->assertStatus(405);
});
