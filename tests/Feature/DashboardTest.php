<?php

use App\Enums\BusinessSubscriptionStatus;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $business = Business::factory()->create([
        'owner_id' => $user->id,
        'status' => RecordStatus::Active,
    ]);
    $user->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

function dashboardOwner(array $overrides = []): User
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'subscription_status' => BusinessSubscriptionStatus::Active,
        ...$overrides,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return $owner;
}

test('owner dashboard sections follow the stored grocery business type', function () {
    $this->actingAs(dashboardOwner(['business_type' => 'grocery_store']))
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.businessType', 'grocery_store')
            ->where('dashboard.focus', 'stock')
            ->where('dashboard.sections', ['lowStock', 'expiring', 'chart', 'topProducts', 'setup'])
            ->has('dashboard.stats', 4));
});

test('owner dashboard sections follow the stored clothing business type', function () {
    $this->actingAs(dashboardOwner(['business_type' => 'clothing_store']))
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.businessType', 'clothing_store')
            ->where('dashboard.focus', 'products')
            ->where('dashboard.sections', ['topProducts', 'chart', 'stagnant', 'lowStock', 'setup'])
            ->has('dashboard.stats', 4));
});

test('owner dashboard sections follow the stored electronics business type', function () {
    $this->actingAs(dashboardOwner(['business_type' => 'electronics']))
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.businessType', 'electronics')
            ->where('dashboard.focus', 'value')
            ->where('dashboard.sections', ['stockValue', 'chart', 'lowStock', 'stagnant', 'setup'])
            ->has('dashboard.stats', 4));
});

test('owner dashboard falls back to general sections for unknown business types', function () {
    $this->actingAs(dashboardOwner(['business_type' => 'Bakery']))
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.businessType', 'Bakery')
            ->where('dashboard.focus', 'general')
            ->where('dashboard.sections', ['chart', 'lowStock', 'stagnant', 'setup']));
});
