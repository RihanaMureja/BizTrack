<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Enums\ServiceFeeStatus;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\ServiceFee;
use App\Models\ServiceFeeSetting;
use App\Models\User;

function serviceFeeBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function serviceFeeSale(Business $business, User $user, float $total = 1000): Sale
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

test('completed cash payment creates platform service fee from business rate', function () {
    [$owner, $business] = serviceFeeBusinessContext();
    ServiceFeeSetting::factory()->create([
        'business_id' => $business->id,
        'fee_rate' => 1.50,
        'is_active' => true,
    ]);
    $sale = serviceFeeSale($business, $owner, 5000);

    $this->actingAs($owner)
        ->post(route('payments.store'), [
            'sale_id' => $sale->id,
            'amount' => 5000,
            'method' => PaymentMethod::Cash->value,
            'reference' => 'CASH-FEE-001',
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();

    $this->assertDatabaseHas('service_fees', [
        'business_id' => $business->id,
        'payment_id' => $payment->id,
        'status' => ServiceFeeStatus::Unpaid->value,
        'fee_rate' => 1.50,
        'payment_amount' => 5000,
        'fee_amount' => 75,
    ]);
});

test('pending payment does not create service fee until verified complete', function () {
    [$owner, $business] = serviceFeeBusinessContext();
    ServiceFeeSetting::factory()->create(['business_id' => $business->id, 'fee_rate' => 1.00]);
    $sale = serviceFeeSale($business, $owner, 2000);

    $this->actingAs($owner)
        ->post(route('payments.store'), [
            'sale_id' => $sale->id,
            'amount' => 1000,
            'method' => PaymentMethod::Bank->value,
            'reference' => 'BANK-FEE-001',
        ])
        ->assertRedirect();

    expect(ServiceFee::query()->count())->toBe(0);

    $payment = Payment::query()->firstOrFail();

    $this->actingAs($owner)
        ->post(route('payments.verify', $payment), [
            'status' => PaymentStatus::Completed->value,
            'reference' => 'BANK-FEE-VERIFIED',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('service_fees', [
        'payment_id' => $payment->id,
        'fee_amount' => 10,
        'status' => ServiceFeeStatus::Unpaid->value,
    ]);
});

test('owner can view service fees and mark unpaid fee as paid', function () {
    [$owner, $business] = serviceFeeBusinessContext();
    $payment = Payment::factory()->create(['business_id' => $business->id, 'user_id' => $owner->id]);
    $fee = ServiceFee::factory()->create([
        'business_id' => $business->id,
        'payment_id' => $payment->id,
        'status' => ServiceFeeStatus::Unpaid,
        'fee_amount' => 25,
    ]);

    $this->actingAs($owner)
        ->get(route('service-fees.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('service-fees/index')
            ->where('summary.total_owed', 25)
            ->where('serviceFees.total', 1));

    $this->actingAs($owner)
        ->post(route('service-fees.pay', $fee))
        ->assertRedirect();

    expect($fee->refresh()->status)->toBe(ServiceFeeStatus::Paid)
        ->and($fee->paid_at)->not->toBeNull();

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $owner->id,
        'action' => 'service_fee.paid',
        'table_name' => 'service_fees',
        'record_id' => $fee->id,
    ]);
});

test('cashier cannot open owner service fee page', function () {
    [$owner, $business] = serviceFeeBusinessContext();
    $cashier = User::factory()->create(['role' => Role::Cashier, 'business_id' => $business->id]);

    $this->actingAs($cashier)
        ->get(route('service-fees.index'))
        ->assertForbidden();
});

test('super admin can view fees and update business fee setting', function () {
    [$owner, $business] = serviceFeeBusinessContext();
    $admin = User::factory()->create(['role' => Role::SuperAdmin]);
    $payment = Payment::factory()->create(['business_id' => $business->id, 'user_id' => $owner->id]);
    ServiceFee::factory()->create([
        'business_id' => $business->id,
        'payment_id' => $payment->id,
        'fee_amount' => 30,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.service-fees.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/service-fees/index')
            ->where('summary.total_owed', 30)
            ->where('serviceFees.total', 1));

    $this->actingAs($admin)
        ->put(route('admin.businesses.service-fee-setting.update', $business), [
            'fee_rate' => 0.75,
            'is_active' => true,
            'terms' => 'Discounted launch service fee.',
            'effective_from' => now()->toDateString(),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('service_fee_settings', [
        'business_id' => $business->id,
        'fee_rate' => 0.75,
        'is_active' => true,
        'terms' => 'Discounted launch service fee.',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $admin->id,
        'action' => 'service_fee.setting_updated',
        'table_name' => 'service_fee_settings',
    ]);
});
