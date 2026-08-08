<?php

use App\Enums\BusinessSubscriptionStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\User;

function appearanceOwner(): User
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'subscription_status' => BusinessSubscriptionStatus::Active,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return $owner;
}

test('appearance page is displayed to owners with brand color props', function () {
    $owner = appearanceOwner();

    $this->actingAs($owner)
        ->get(route('appearance.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/appearance')
            ->where('canManageBrandColor', true)
            ->where('brandColor', null));
});

test('appearance page exposes the stored brand color', function () {
    $owner = appearanceOwner();
    $owner->ownedBusiness->forceFill(['brand_color' => '#e63946'])->save();

    $this->actingAs($owner)
        ->get(route('appearance.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/appearance')
            ->where('brandColor', '#e63946'));
});

test('owner can update their brand color', function () {
    $owner = appearanceOwner();

    $this->actingAs($owner)
        ->put(route('appearance.update'), ['brand_color' => '#e63946'])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($owner->ownedBusiness->refresh()->brand_color)->toBe('#e63946');
});

test('owner can reset their brand color to default', function () {
    $owner = appearanceOwner();
    $owner->ownedBusiness->forceFill(['brand_color' => '#e63946'])->save();

    $this->actingAs($owner)
        ->put(route('appearance.update'), ['brand_color' => ''])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($owner->ownedBusiness->refresh()->brand_color)->toBeNull();
});

test('brand color must be a valid hex color', function () {
    $owner = appearanceOwner();

    $this->actingAs($owner)
        ->put(route('appearance.update'), ['brand_color' => 'red'])
        ->assertSessionHasErrors('brand_color');
});

test('cashiers cannot manage the business brand color', function () {
    $business = Business::factory()->create([
        'subscription_status' => BusinessSubscriptionStatus::Active,
    ]);
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($cashier)
        ->get(route('appearance.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/appearance')
            ->where('canManageBrandColor', false));

    $this->actingAs($cashier)
        ->put(route('appearance.update'), ['brand_color' => '#e63946'])
        ->assertForbidden();
});
