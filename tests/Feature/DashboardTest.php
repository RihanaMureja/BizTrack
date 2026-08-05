<?php

use App\Enums\RecordStatus;
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
