<?php

use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\Sale;
use App\Models\User;
use App\Services\CreditScoringService;

test('credit limit is suggested from purchase and payment behavior with owner override preserved', function () {
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'credit_limit' => 1500,
    ]);
    $saleA = Sale::factory()->create([
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'user_id' => $owner->id,
        'grand_total' => 1000,
        'sold_at' => now()->subDays(90),
    ]);
    $saleB = Sale::factory()->create([
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'user_id' => $owner->id,
        'grand_total' => 3000,
        'sold_at' => now()->subDays(10),
    ]);
    CustomerCredit::factory()->create([
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'sale_id' => $saleA->id,
        'remaining_balance' => 0,
        'status' => PaymentStatus::Completed,
        'due_date' => now()->subDays(30),
        'paid_at' => now()->subDays(35),
    ]);
    CustomerCredit::factory()->create([
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'sale_id' => $saleB->id,
        'remaining_balance' => 0,
        'status' => PaymentStatus::Completed,
        'due_date' => now()->subDays(5),
        'paid_at' => now()->subDays(6),
    ]);

    $profile = app(CreditScoringService::class)->syncProfile($customer);

    expect((float) $profile->total_purchase_volume)->toBe(4000.0)
        ->and((float) $profile->average_order_value)->toBe(2000.0)
        ->and((float) $profile->on_time_payment_rate)->toBe(100.0)
        ->and((float) $profile->suggested_credit_limit)->toBeGreaterThan(0)
        ->and((float) $profile->owner_credit_limit_override)->toBe(1500.0);
});

test('owner can override customer credit limit from credit discounts module', function () {
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'credit_limit' => 0,
    ]);

    $this->actingAs($owner)
        ->put(route('credit-discounts.customers.credit-limit.update', $customer), [
            'credit_limit' => 2500,
        ])
        ->assertRedirect();

    expect((float) $customer->refresh()->credit_limit)->toBe(2500.0)
        ->and((float) $customer->creditProfile->owner_credit_limit_override)->toBe(2500.0);
});
