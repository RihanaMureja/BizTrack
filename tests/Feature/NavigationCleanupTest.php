<?php

use App\Enums\BusinessAccessMode;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\User;

test('settings and business profile are not main sidebar items for owners', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Active,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('navigation', fn ($navigation) => ! collect($navigation)
                ->pluck('title')
                ->intersect(['Settings', 'Business Profile'])
                ->isNotEmpty()));
});

test('settings is not a main sidebar item for super admins', function () {
    $superAdmin = User::factory()->create([
        'role' => Role::SuperAdmin,
    ]);

    $this->actingAs($superAdmin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('navigation', fn ($navigation) => ! collect($navigation)->pluck('title')->contains('Settings')));
});

test('business profile lives under settings business tab for owners', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Active,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->get(route('settings.business.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/business')
            ->where('business.id', $business->id));
});
