<?php

use App\Enums\BusinessSubscriptionStatus;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\User;

function subsOwner(): User
{
    return User::factory()->create(['role' => Role::Owner]);
}

function subsBusiness(User $owner, array $overrides = []): Business
{
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'subscription_status' => BusinessSubscriptionStatus::None,
        'subscription_id' => null,
        'subscription_started_at' => null,
        'subscription_ends_at' => null,
        ...$overrides,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    return $business;
}

function subsPlan(float $price, array $overrides = []): Subscription
{
    return Subscription::factory()->create([
        'price' => $price,
        'status' => RecordStatus::Active,
        ...$overrides,
    ]);
}

test('an owner who has not started any subscription is eligible to start the free trial', function () {
    $owner = subsOwner();
    subsBusiness($owner);
    subsPlan(0);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('subscriptionStatus', BusinessSubscriptionStatus::None->value)
            ->where('currentPlanId', null)
            ->has('subscriptions')
        );
});

test('an owner currently on the free trial is reported as an active trial user', function () {
    $owner = subsOwner();
    $freeTrial = subsPlan(0, ['duration_days' => 30]);
    subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Active,
        'subscription_id' => $freeTrial->id,
        'subscription_ends_at' => now()->addDays(20),
    ]);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('subscriptionStatus', BusinessSubscriptionStatus::Active->value)
            ->where('currentPlanId', $freeTrial->id)
        );
});

test('an owner with an expired free trial is reported as expired', function () {
    $owner = subsOwner();
    $freeTrial = subsPlan(0);
    subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Expired,
        'subscription_id' => $freeTrial->id,
        'subscription_ends_at' => now()->subDay(),
    ]);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('subscriptionStatus', BusinessSubscriptionStatus::Expired->value)
            ->where('currentPlanId', $freeTrial->id)
        );
});

test('an owner who already used the free trial is reported as cancelled and is not offered a trial again', function () {
    $owner = subsOwner();
    $freeTrial = subsPlan(0);
    subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Cancelled,
        'subscription_id' => $freeTrial->id,
    ]);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('subscriptionStatus', BusinessSubscriptionStatus::Cancelled->value)
            ->where('currentPlanId', $freeTrial->id)
        );
});

test('an owner with an active paid subscription is reported as an active paid subscriber', function () {
    $owner = subsOwner();
    $paidPlan = subsPlan(499);
    subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Active,
        'subscription_id' => $paidPlan->id,
        'subscription_ends_at' => now()->addMonth(),
    ]);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('subscriptionStatus', BusinessSubscriptionStatus::Active->value)
            ->where('currentPlanId', $paidPlan->id)
        );
});

test('a subscription with plenty of time left is not flagged as expiring', function () {
    $owner = subsOwner();
    $freeTrial = subsPlan(0);
    subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Active,
        'subscription_id' => $freeTrial->id,
        'subscription_ends_at' => now()->addDays(20)->addHour(),
    ]);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('recommendation.isExpiring', false)
            ->where('recommendation.daysRemaining', 20)
            ->where('recommendation.reason', null)
        );
});

test('a subscription inside the 10-day window is flagged as expiring with the next plan recommended', function () {
    $owner = subsOwner();
    $freeTrial = subsPlan(0);
    $growth = subsPlan(499);
    subsPlan(999);
    subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Active,
        'subscription_id' => $freeTrial->id,
        'subscription_ends_at' => now()->addDays(10)->addHour(),
    ]);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('recommendation.isExpiring', true)
            ->where('recommendation.daysRemaining', 10)
            ->where('recommendation.reason', 'expiring')
            ->where('recommendation.currentPlan.id', $freeTrial->id)
            ->where('recommendation.recommendedPlan.id', $growth->id)
            ->where('recommendation.isRenewal', false)
        );
});

test('a subscription expiring in the last five days is still flagged as expiring', function () {
    $owner = subsOwner();
    $freeTrial = subsPlan(0);
    subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Active,
        'subscription_id' => $freeTrial->id,
        'subscription_ends_at' => now()->addDays(5)->addHour(),
    ]);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('recommendation.isExpiring', true)
            ->where('recommendation.daysRemaining', 5)
        );
});

test('an owner at the cashier limit gets the next plan recommended', function () {
    $owner = subsOwner();
    $growth = subsPlan(499, ['max_cashiers' => 5]);
    $pro = subsPlan(999, ['max_cashiers' => 15]);
    $business = subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Active,
        'subscription_id' => $growth->id,
        'subscription_ends_at' => now()->addMonth(),
    ]);
    User::factory()->count(5)->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('recommendation.limitReached', true)
            ->where('recommendation.reason', 'limit')
            ->where('recommendation.cashiersCount', 5)
            ->where('recommendation.maxCashiers', 5)
            ->where('recommendation.currentPlan.id', $growth->id)
            ->where('recommendation.recommendedPlan.id', $pro->id)
            ->where('recommendation.isRenewal', false)
        );
});

test('an owner on the highest plan is recommended to renew the current plan', function () {
    $owner = subsOwner();
    $pro = subsPlan(999, ['max_cashiers' => 15]);
    subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Active,
        'subscription_id' => $pro->id,
        'subscription_ends_at' => now()->addDays(10)->addHour(),
    ]);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('recommendation.isExpiring', true)
            ->where('recommendation.reason', 'expiring')
            ->where('recommendation.recommendedPlan.id', $pro->id)
            ->where('recommendation.isRenewal', true)
        );
});

test('an expired subscription is enforced and the owner is routed to plan selection', function () {
    $owner = subsOwner();
    $paidPlan = subsPlan(499);
    $business = subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Active,
        'subscription_id' => $paidPlan->id,
        'subscription_ends_at' => now()->subDay(),
    ]);

    $this->actingAs($owner)
        ->get(route('business.subscriptions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/subscriptions')
            ->where('subscriptionStatus', BusinessSubscriptionStatus::Expired->value)
            ->where('recommendation.status', BusinessSubscriptionStatus::Expired->value)
            ->where('recommendation.isExpiring', false)
        );

    expect($business->refresh()->subscription_status)->toBe(BusinessSubscriptionStatus::Expired)
        ->and($business->hasActiveSubscription())->toBeFalse();

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertRedirect(route('subscriptions.select'));
});

test('the subscriptions:expire command marks ended subscriptions as expired', function () {
    $owner = subsOwner();
    $plan = subsPlan(499);
    $expiredBusiness = subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Active,
        'subscription_id' => $plan->id,
        'subscription_ends_at' => now()->subDay(),
    ]);
    $otherOwner = subsOwner();
    $activeBusiness = subsBusiness($otherOwner, [
        'subscription_status' => BusinessSubscriptionStatus::Active,
        'subscription_id' => $plan->id,
        'subscription_ends_at' => now()->addMonth(),
    ]);

    $this->artisan('subscriptions:expire')->assertSuccessful();

    expect($expiredBusiness->refresh()->subscription_status)->toBe(BusinessSubscriptionStatus::Expired)
        ->and($activeBusiness->refresh()->subscription_status)->toBe(BusinessSubscriptionStatus::Active);
});

test('an expired owner sees the expired state on the plan selection page', function () {
    $owner = subsOwner();
    $paidPlan = subsPlan(499);
    subsBusiness($owner, [
        'subscription_status' => BusinessSubscriptionStatus::Expired,
        'subscription_id' => $paidPlan->id,
        'subscription_ends_at' => now()->subDay(),
    ]);

    $this->actingAs($owner)
        ->get(route('subscriptions.select'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/subscription-select')
            ->where('subscriptionStatus', BusinessSubscriptionStatus::Expired->value)
            ->where('recommendation.status', BusinessSubscriptionStatus::Expired->value)
        );
});

test('a fresh owner is recommended the cheapest starting plan on plan selection', function () {
    $owner = subsOwner();
    subsBusiness($owner);
    $trial = subsPlan(0);
    subsPlan(499);
    subsPlan(999);

    $this->actingAs($owner)
        ->get(route('subscriptions.select'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/subscription-select')
            ->where('recommendation.status', BusinessSubscriptionStatus::None->value)
            ->where('recommendation.reason', null)
            ->where('recommendation.recommendedPlan.id', $trial->id)
        );
});
