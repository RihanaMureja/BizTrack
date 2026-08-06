<?php

use App\Enums\BusinessSubscriptionStatus;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\User;

function onboardingOwner(): User
{
    return User::factory()->create(['role' => Role::Owner]);
}

function onboardingBusiness(User $owner, array $overrides = []): Business
{
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'subscription_status' => BusinessSubscriptionStatus::None,
        ...$overrides,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    return $business;
}

test('owner with no business is sent to business setup from the dashboard', function () {
    $this->actingAs(onboardingOwner())
        ->get(route('dashboard'))
        ->assertRedirect(route('business.setup'));
});

test('owner can set up their business and is sent to subscription selection', function () {
    $owner = onboardingOwner();

    $this->actingAs($owner)
        ->post(route('business.setup.store'), [
            'business_name' => 'Merkato Fresh Mart',
            'business_type' => 'grocery_store',
        ])
        ->assertRedirect(route('subscriptions.select'));

    $this->assertDatabaseHas('businesses', [
        'owner_id' => $owner->id,
        'business_name' => 'Merkato Fresh Mart',
        'business_type' => 'grocery_store',
        'status' => RecordStatus::Active->value,
    ]);

    expect($owner->refresh()->business_id)->not->toBeNull();
});

test('business setup requires a business type', function () {
    $owner = onboardingOwner();

    $this->actingAs($owner)
        ->post(route('business.setup.store'), [
            'business_name' => 'Merkato Fresh Mart',
            'business_type' => 'not-a-real-type',
        ])
        ->assertSessionHasErrors('business_type');
});

test('owner with a business but no active subscription is sent to subscription selection', function () {
    $owner = onboardingOwner();
    onboardingBusiness($owner);

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertRedirect(route('subscriptions.select'));
});

test('subscription selection page lists active plans', function () {
    $owner = onboardingOwner();
    onboardingBusiness($owner);
    Subscription::factory()->create(['name' => 'Business', 'status' => RecordStatus::Active]);

    $this->actingAs($owner)
        ->get(route('subscriptions.select'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/subscription-select')
            ->where('subscriptionStatus', BusinessSubscriptionStatus::None->value)
            ->has('plans')
        );
});

test('owner can start a free trial subscription and reach the dashboard', function () {
    $owner = onboardingOwner();
    $business = onboardingBusiness($owner);
    $freeTrial = Subscription::factory()->create([
        'price' => 0,
        'duration_days' => 30,
        'status' => RecordStatus::Active,
    ]);

    $this->actingAs($owner)
        ->post(route('subscriptions.select.store'), ['plan_id' => $freeTrial->id])
        ->assertRedirect(route('dashboard'));

    $business->refresh();

    expect($business->subscription_status)->toBe(BusinessSubscriptionStatus::Active)
        ->and($business->subscription_started_at)->not->toBeNull()
        ->and($business->subscription_ends_at)->not->toBeNull()
        ->and($business->hasActiveSubscription())->toBeTrue();

    $this->actingAs($owner)->get(route('dashboard'))->assertOk();
});

test('paid plan selection creates a pending subscription', function () {
    $owner = onboardingOwner();
    $business = onboardingBusiness($owner);
    $paidPlan = Subscription::factory()->create([
        'price' => 499,
        'status' => RecordStatus::Active,
    ]);

    $this->actingAs($owner)
        ->post(route('subscriptions.select.store'), ['plan_id' => $paidPlan->id])
        ->assertRedirect(route('subscriptions.select'))
        ->assertSessionHas('status');

    expect($business->refresh()->subscription_status)->toBe(BusinessSubscriptionStatus::Pending);
});

test('plan selection requires an active plan', function () {
    $owner = onboardingOwner();
    onboardingBusiness($owner);
    $inactivePlan = Subscription::factory()->create(['status' => RecordStatus::Inactive]);

    $this->actingAs($owner)
        ->post(route('subscriptions.select.store'), ['plan_id' => $inactivePlan->id])
        ->assertSessionHasErrors('plan_id');
});

test('owner with an active subscription can access the dashboard', function () {
    $owner = User::factory()->create(['role' => Role::Owner]);
    onboardingBusiness($owner, ['subscription_status' => BusinessSubscriptionStatus::Active]);

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk();
});

test('cashier in an active business without a subscription is not redirected to onboarding', function () {
    $business = Business::factory()->create([
        'subscription_status' => BusinessSubscriptionStatus::None,
    ]);
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($cashier)
        ->get(route('dashboard'))
        ->assertOk();
});

test('new registration redirects an owner to business setup', function () {
    $this->post(route('register'), [
        'first_name' => 'Meron',
        'last_name' => 'Abebe',
        'email' => 'meron@biztrack.test',
        'phone' => '0911223344',
        'password' => 'StrongPass#123',
        'password_confirmation' => 'StrongPass#123',
    ])->assertRedirect(route('business.setup'));

    $this->assertDatabaseHas('users', [
        'email' => 'meron@biztrack.test',
        'role' => Role::Owner->value,
    ]);
});
