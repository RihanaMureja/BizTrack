<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\User;

function creditBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function creditSale(Business $business, User $user, Customer $customer, float $total = 100): Sale
{
    return Sale::factory()->create([
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'user_id' => $user->id,
        'is_credit_sale' => true,
        'grand_total' => $total,
        'paid_amount' => 0,
        'balance_due' => $total,
        'payment_status' => PaymentStatus::Unpaid,
    ]);
}

test('partial customer sale creates a credit record and updates customer balance', function () {
    [$owner, $business] = creditBusinessContext();
    $customer = Customer::factory()->create(['business_id' => $business->id, 'current_balance' => 0]);
    $sale = creditSale($business, $owner, $customer, 120);

    app(\App\Services\CustomerCreditService::class)->syncForSale($sale);

    $credit = CustomerCredit::query()->firstOrFail();
    expect((float) $credit->credit_amount)->toBe(120.0)
        ->and((float) $credit->remaining_balance)->toBe(120.0)
        ->and($credit->status)->toBe(PaymentStatus::Unpaid)
        ->and((float) $customer->refresh()->current_balance)->toBe(120.0);
});

test('completed payment reduces credit and marks partial balance', function () {
    [$owner, $business] = creditBusinessContext();
    $customer = Customer::factory()->create(['business_id' => $business->id, 'current_balance' => 0]);
    $sale = creditSale($business, $owner, $customer, 100);
    app(\App\Services\CustomerCreditService::class)->syncForSale($sale);

    $this->actingAs($owner)
        ->post(route('sales.checkout.store', $sale), [
            'amount' => 40,
            'method' => PaymentMethod::Cash->value,
        ])
        ->assertRedirect();

    $credit = CustomerCredit::query()->firstOrFail();
    expect((float) $credit->refresh()->paid_amount)->toBe(40.0)
        ->and((float) $credit->remaining_balance)->toBe(60.0)
        ->and($credit->status)->toBe(PaymentStatus::Partial)
        ->and((float) $customer->refresh()->current_balance)->toBe(60.0);
});

test('full payment marks customer credit as paid and clears customer balance', function () {
    [$owner, $business] = creditBusinessContext();
    $customer = Customer::factory()->create(['business_id' => $business->id, 'current_balance' => 0]);
    $sale = creditSale($business, $owner, $customer, 75);
    app(\App\Services\CustomerCreditService::class)->syncForSale($sale);

    $this->actingAs($owner)
        ->post(route('sales.checkout.store', $sale), [
            'amount' => 75,
            'method' => PaymentMethod::Cash->value,
        ])
        ->assertRedirect();

    $credit = CustomerCredit::query()->firstOrFail();
    expect((float) $credit->refresh()->remaining_balance)->toBe(0.0)
        ->and($credit->status)->toBe(PaymentStatus::Completed)
        ->and($credit->paid_at)->not->toBeNull()
        ->and((float) $customer->refresh()->current_balance)->toBe(0.0);
});

test('pending digital payment does not reduce customer credit until verified', function () {
    [$owner, $business] = creditBusinessContext();
    $customer = Customer::factory()->create(['business_id' => $business->id, 'current_balance' => 0]);
    $sale = creditSale($business, $owner, $customer, 90);
    app(\App\Services\CustomerCreditService::class)->syncForSale($sale);

    $this->actingAs($owner)
        ->post(route('sales.checkout.store', $sale), [
            'amount' => 90,
            'method' => PaymentMethod::Telebirr->value,
            'phone' => '0911222333',
        ])
        ->assertRedirect();

    $credit = CustomerCredit::query()->firstOrFail();
    expect((float) $credit->refresh()->remaining_balance)->toBe(90.0)
        ->and((float) $customer->refresh()->current_balance)->toBe(90.0);

    $payment = Payment::query()->firstOrFail();
    $this->actingAs($owner)
        ->post(route('payments.verify', $payment), [
            'status' => PaymentStatus::Completed->value,
            'reference' => 'TEL-OK',
        ])
        ->assertRedirect(route('payments.show', $payment));

    expect((float) $credit->refresh()->remaining_balance)->toBe(0.0)
        ->and($credit->status)->toBe(PaymentStatus::Completed)
        ->and((float) $customer->refresh()->current_balance)->toBe(0.0);
});

test('credit can be marked overdue and reminded', function () {
    [$owner, $business] = creditBusinessContext();
    $customer = Customer::factory()->create(['business_id' => $business->id]);
    $sale = creditSale($business, $owner, $customer, 60);
    $credit = CustomerCredit::factory()->create([
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'sale_id' => $sale->id,
        'credit_amount' => 60,
        'paid_amount' => 0,
        'remaining_balance' => 60,
        'status' => PaymentStatus::Unpaid,
        'due_date' => today()->subDay(),
    ]);

    $this->actingAs($owner)
        ->post(route('customer-credits.overdue', $credit))
        ->assertRedirect();

    expect($credit->refresh()->status)->toBe(PaymentStatus::Overdue);

    $this->actingAs($owner)
        ->post(route('customer-credits.remind', $credit))
        ->assertRedirect();

    expect($credit->refresh()->reminded_at)->not->toBeNull()
        ->and(Notification::query()->where('type', 'credit_reminder')->where('business_id', $business->id)->exists())->toBeTrue();
});

test('cashier from another business cannot manage credit', function () {
    [$owner, $business] = creditBusinessContext();
    $customer = Customer::factory()->create(['business_id' => $business->id]);
    $sale = creditSale($business, $owner, $customer);
    $credit = CustomerCredit::factory()->create([
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'sale_id' => $sale->id,
    ]);

    [, $otherBusiness] = creditBusinessContext();
    $cashier = User::factory()->create(['role' => Role::Cashier, 'business_id' => $otherBusiness->id]);

    $this->actingAs($cashier)
        ->post(route('customer-credits.remind', $credit))
        ->assertForbidden();
});
