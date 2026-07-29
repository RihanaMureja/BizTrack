<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Events\PaymentCompleted;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Facades\Event;

function paymentBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function unpaidSale(Business $business, User $user, float $total = 100): Sale
{
    return Sale::factory()->create([
        'business_id' => $business->id,
        'user_id' => $user->id,
        'grand_total' => $total,
        'paid_amount' => 0,
        'balance_due' => $total,
        'payment_status' => PaymentStatus::Unpaid,
    ]);
}

test('guests are redirected from payments', function () {
    $this->get(route('payments.index'))->assertRedirect(route('login'));
});

test('owner can open payments page', function () {
    [$owner, $business] = paymentBusinessContext();
    unpaidSale($business, $owner);

    $this->actingAs($owner)
        ->get(route('payments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('payments/index')
            ->where('payments.total', 0)
            ->has('sales', 1)
            ->has('methods', 4));
});

test('cash payment completes immediately and updates sale balance', function () {
    Event::fake([PaymentCompleted::class]);
    [$owner, $business] = paymentBusinessContext();
    $cashier = User::factory()->create(['role' => Role::Cashier, 'business_id' => $business->id]);
    $sale = unpaidSale($business, $owner, 100);

    $this->actingAs($cashier)
        ->post(route('payments.store'), [
            'sale_id' => $sale->id,
            'amount' => 100,
            'method' => PaymentMethod::Cash->value,
            'reference' => 'CASH-001',
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();
    expect($payment->status)->toBe(PaymentStatus::Completed)
        ->and($payment->method)->toBe(PaymentMethod::Cash)
        ->and((float) $sale->refresh()->paid_amount)->toBe(100.0)
        ->and((float) $sale->balance_due)->toBe(0.0)
        ->and($sale->payment_status)->toBe(PaymentStatus::Completed);

    Event::assertDispatched(PaymentCompleted::class);
});

test('bank payment is pending until verified', function () {
    Event::fake([PaymentCompleted::class]);
    [$owner, $business] = paymentBusinessContext();
    $sale = unpaidSale($business, $owner, 120);

    $this->actingAs($owner)
        ->post(route('payments.store'), [
            'sale_id' => $sale->id,
            'amount' => 80,
            'method' => PaymentMethod::Bank->value,
            'reference' => 'BANK-001',
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();
    expect($payment->status)->toBe(PaymentStatus::Pending)
        ->and((float) $sale->refresh()->paid_amount)->toBe(0.0)
        ->and($sale->payment_status)->toBe(PaymentStatus::Unpaid);

    Event::assertNotDispatched(PaymentCompleted::class);

    $this->actingAs($owner)
        ->post(route('payments.verify', $payment), [
            'status' => PaymentStatus::Completed->value,
            'reference' => 'BANK-VERIFIED',
        ])
        ->assertRedirect(route('payments.show', $payment));

    expect($payment->refresh()->status)->toBe(PaymentStatus::Completed)
        ->and((float) $sale->refresh()->paid_amount)->toBe(80.0)
        ->and((float) $sale->balance_due)->toBe(40.0)
        ->and($sale->payment_status)->toBe(PaymentStatus::Partial);

    Event::assertDispatched(PaymentCompleted::class);
});

test('payment cannot exceed remaining sale balance', function () {
    [$owner, $business] = paymentBusinessContext();
    $sale = unpaidSale($business, $owner, 75);

    $this->actingAs($owner)
        ->post(route('payments.store'), [
            'sale_id' => $sale->id,
            'amount' => 76,
            'method' => PaymentMethod::Cash->value,
        ])
        ->assertSessionHasErrors('amount');

    expect(Payment::query()->count())->toBe(0)
        ->and((float) $sale->refresh()->paid_amount)->toBe(0.0);
});

test('user cannot pay another business sale', function () {
    [$owner] = paymentBusinessContext();
    [, $otherBusiness] = paymentBusinessContext();
    $sale = Sale::factory()->create(['business_id' => $otherBusiness->id]);

    $this->actingAs($owner)
        ->post(route('payments.store'), [
            'sale_id' => $sale->id,
            'amount' => 20,
            'method' => PaymentMethod::Cash->value,
        ])
        ->assertSessionHasErrors('sale_id');
});

test('completed payment creates notification and audit log', function () {
    [$owner, $business] = paymentBusinessContext();
    $sale = unpaidSale($business, $owner, 50);

    $this->actingAs($owner)
        ->post(route('payments.store'), [
            'sale_id' => $sale->id,
            'amount' => 50,
            'method' => PaymentMethod::Cash->value,
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();

    expect(Notification::query()
        ->where('business_id', $business->id)
        ->where('type', 'payment_received')
        ->exists())->toBeTrue();

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $owner->id,
        'action' => 'payment_completed',
        'table_name' => 'payments',
        'record_id' => $payment->id,
    ]);

    $log = AuditLog::query()->where('record_id', $payment->id)->where('action', 'payment_completed')->firstOrFail();
    expect($log->new_values['payment_number'])->toBe($payment->payment_number);
});

test('cashier from another business cannot view payment', function () {
    [$owner, $business] = paymentBusinessContext();
    $sale = unpaidSale($business, $owner);
    $payment = Payment::factory()->create([
        'business_id' => $business->id,
        'sale_id' => $sale->id,
        'user_id' => $owner->id,
    ]);

    [, $otherBusiness] = paymentBusinessContext();
    $otherCashier = User::factory()->create(['role' => Role::Cashier, 'business_id' => $otherBusiness->id]);

    $this->actingAs($otherCashier)
        ->get(route('payments.show', $payment))
        ->assertForbidden();
});
