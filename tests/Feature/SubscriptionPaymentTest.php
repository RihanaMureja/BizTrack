<?php

use App\Enums\BusinessSubscriptionStatus;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Enums\SubscriptionPaymentStatus;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Illuminate\Support\Facades\Http;

function paymentOwner(): User
{
    return User::factory()->create(['role' => Role::Owner]);
}

function paymentBusiness(User $owner, array $overrides = []): Business
{
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'subscription_status' => BusinessSubscriptionStatus::None,
        ...$overrides,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    return $business;
}

function paymentPlan(float $price, array $overrides = []): Subscription
{
    return Subscription::factory()->create([
        'price' => $price,
        'status' => RecordStatus::Active,
        ...$overrides,
    ]);
}

function chapaInitOk(string $checkoutUrl = 'https://checkout.chapa.example/pay/abc'): void
{
    Http::fake([
        'https://chapa.test/v1/transaction/initialize' => Http::response([
            'status' => 'success',
            'data' => [
                'checkout_url' => $checkoutUrl,
                'tx_ref' => 'sbt_chapa_ref',
            ],
        ]),
    ]);
}

function chapaVerify(bool $confirmed): void
{
    Http::fake([
        'https://chapa.test/v1/transaction/verify/*' => Http::response([
            'status' => $confirmed ? 'success' : 'failed',
            'data' => [
                'status' => $confirmed ? 'success' : 'failed',
            ],
        ]),
    ]);
}

beforeEach(function () {
    config(['services.chapa.base_url' => 'https://chapa.test/v1']);
    config(['services.chapa.secret_key' => 'test-secret']);
    Http::preventStrayRequests();
});

test('payment page renders a paid plan for the owner', function () {
    $owner = paymentOwner();
    paymentBusiness($owner);
    $plan = paymentPlan(499);

    $this->actingAs($owner)
        ->get(route('subscriptions.payment', ['plan' => $plan->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/subscription-payment')
            ->where('plan.id', $plan->id)
            ->where('plan.price', '499.00')
        );
});

test('payment page rejects free plans and inactive plans', function () {
    $owner = paymentOwner();
    paymentBusiness($owner);
    $freePlan = paymentPlan(0);
    $inactivePlan = paymentPlan(499, ['status' => RecordStatus::Inactive]);

    $this->actingAs($owner)
        ->get(route('subscriptions.payment', ['plan' => $freePlan->id]))
        ->assertRedirect(route('subscriptions.select'));

    $this->actingAs($owner)
        ->get(route('subscriptions.payment', ['plan' => $inactivePlan->id]))
        ->assertRedirect(route('subscriptions.select'));
});

test('payment page redirects an owner with an active subscription to the dashboard', function () {
    $owner = paymentOwner();
    paymentBusiness($owner, ['subscription_status' => BusinessSubscriptionStatus::Active]);
    $plan = paymentPlan(499);

    $this->actingAs($owner)
        ->get(route('subscriptions.payment', ['plan' => $plan->id]))
        ->assertRedirect(route('dashboard'));
});

test('owner can start a payment and is sent to the Chapa checkout URL', function () {
    $owner = paymentOwner();
    $business = paymentBusiness($owner);
    $plan = paymentPlan(499);
    chapaInitOk();

    $response = $this->actingAs($owner)
        ->withHeader('X-Inertia', 'true')
        ->post(route('subscriptions.payment.initialize'), ['plan_id' => $plan->id]);

    $response->assertStatus(409);
    $response->assertHeader('X-Inertia-Location', 'https://checkout.chapa.example/pay/abc');

    $this->assertDatabaseHas('subscription_payments', [
        'business_id' => $business->id,
        'subscription_id' => $plan->id,
        'user_id' => $owner->id,
        'amount' => 499.0,
        'status' => SubscriptionPaymentStatus::Pending->value,
    ]);
});

test('the amount always comes from the subscription price, not the request', function () {
    $owner = paymentOwner();
    paymentBusiness($owner);
    $plan = paymentPlan(999);
    chapaInitOk();

    $this->actingAs($owner)
        ->post(route('subscriptions.payment.initialize'), ['plan_id' => $plan->id, 'amount' => 1]);

    $this->assertDatabaseHas('subscription_payments', [
        'subscription_id' => $plan->id,
        'amount' => 999.0,
    ]);
});

test('failed payment initialization marks the payment failed and does not activate', function () {
    $owner = paymentOwner();
    $business = paymentBusiness($owner);
    $plan = paymentPlan(499);

    Http::fake([
        'https://chapa.test/v1/transaction/initialize' => Http::response(['message' => 'bad key'], 401),
    ]);

    $this->actingAs($owner)
        ->post(route('subscriptions.payment.initialize'), ['plan_id' => $plan->id])
        ->assertRedirect(route('subscriptions.payment', ['plan' => $plan->id]))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('subscription_payments', [
        'business_id' => $business->id,
        'subscription_id' => $plan->id,
        'status' => SubscriptionPaymentStatus::Failed->value,
    ]);

    expect($business->refresh()->subscription_status)->toBe(BusinessSubscriptionStatus::None);
});

test('verified payment activates the subscription', function () {
    $owner = paymentOwner();
    $business = paymentBusiness($owner);
    $plan = paymentPlan(499);
    $payment = SubscriptionPayment::factory()->create([
        'business_id' => $business->id,
        'subscription_id' => $plan->id,
        'user_id' => $owner->id,
        'amount' => 499,
        'status' => SubscriptionPaymentStatus::Pending,
    ]);
    chapaVerify(true);

    $this->actingAs($owner)
        ->get(route('subscriptions.payment.callback', ['reference' => $payment->reference]))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas('status');

    $payment->refresh();
    expect($payment->status)->toBe(SubscriptionPaymentStatus::Paid)
        ->and($payment->paid_at)->not->toBeNull()
        ->and($payment->verified_at)->not->toBeNull()
        ->and($payment->chapa_response)->not->toBeNull();

    $business->refresh();
    expect($business->subscription_status)->toBe(BusinessSubscriptionStatus::Active)
        ->and($business->subscription_id)->toBe($plan->id)
        ->and($business->hasActiveSubscription())->toBeTrue();
});

test('unverified payment is marked failed and does not activate the subscription', function () {
    $owner = paymentOwner();
    $business = paymentBusiness($owner);
    $plan = paymentPlan(499);
    $payment = SubscriptionPayment::factory()->create([
        'business_id' => $business->id,
        'subscription_id' => $plan->id,
        'user_id' => $owner->id,
        'amount' => 499,
        'status' => SubscriptionPaymentStatus::Pending,
    ]);
    chapaVerify(false);

    $this->actingAs($owner)
        ->get(route('subscriptions.payment.callback', ['reference' => $payment->reference]))
        ->assertRedirect(route('subscriptions.payment', ['plan' => $plan->id]))
        ->assertSessionHas('error');

    $payment->refresh();
    expect($payment->status)->toBe(SubscriptionPaymentStatus::Failed);

    $business->refresh();
    expect($business->subscription_status)->toBe(BusinessSubscriptionStatus::None);
});

test('verifying an already paid payment does not change the subscription period twice', function () {
    $owner = paymentOwner();
    $business = paymentBusiness($owner, ['subscription_status' => BusinessSubscriptionStatus::Active]);
    $plan = paymentPlan(499);
    $payment = SubscriptionPayment::factory()->create([
        'business_id' => $business->id,
        'subscription_id' => $plan->id,
        'user_id' => $owner->id,
        'amount' => 499,
        'status' => SubscriptionPaymentStatus::Paid,
    ]);

    Http::fake();

    $this->actingAs($owner)
        ->get(route('subscriptions.payment.callback', ['reference' => $payment->reference]))
        ->assertRedirect(route('dashboard'));

    $business->refresh();
    expect($business->subscription_status)->toBe(BusinessSubscriptionStatus::Active)
        ->and($payment->refresh()->status)->toBe(SubscriptionPaymentStatus::Paid);
});

test('callback with an unknown reference returns to plan selection', function () {
    $owner = paymentOwner();
    paymentBusiness($owner);

    $this->actingAs($owner)
        ->get(route('subscriptions.payment.callback', ['reference' => 'sbt_missing']))
        ->assertRedirect(route('subscriptions.select'))
        ->assertSessionHas('error');
});

test('super admin can view subscription payments', function () {
    $admin = User::factory()->create(['role' => Role::SuperAdmin]);
    $owner = paymentOwner();
    $business = paymentBusiness($owner);
    $plan = paymentPlan(499);
    SubscriptionPayment::factory()->count(3)->create([
        'business_id' => $business->id,
        'subscription_id' => $plan->id,
        'user_id' => $owner->id,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.subscription-payments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/subscription-payments/index')
            ->has('payments.data', 3)
        );
});

test('non-super-admin cannot view subscription payments', function () {
    $owner = paymentOwner();
    paymentBusiness($owner);

    $this->actingAs($owner)
        ->get(route('admin.subscription-payments.index'))
        ->assertForbidden();
});
