<?php

use App\Enums\BusinessAccessMode;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\User;
use App\Notifications\TrialStartedNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

test('new owner is redirected into onboarding before dashboard access', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertRedirect(route('onboarding.index', absolute: false));
});

test('owner can verify phone using an onboarding otp', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
        'phone' => null,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'access_mode' => BusinessAccessMode::Onboarding,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->post(route('onboarding.verify-phone.send'), [
            'phone' => '0911223344',
        ])
        ->assertRedirect();

    $verification = $owner->phoneVerifications()->latest()->first();

    $verification->forceFill([
        'code_hash' => Hash::make('123456'),
    ])->save();

    $this->actingAs($owner)
        ->post(route('onboarding.verify-phone.confirm'), [
            'phone' => '0911223344',
            'code' => '123456',
        ])
        ->assertRedirect(route('onboarding.choose-plan', absolute: false));

    expect($owner->refresh()->phone)->toBe('0911223344');
});

test('verified owner can start a trial and access the app', function () {
    Notification::fake();

    $owner = User::factory()->create([
        'role' => Role::Owner,
        'phone' => '0911223344',
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Onboarding,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->post(route('onboarding.trial.store'))
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'access_mode' => BusinessAccessMode::Trial->value,
    ]);

    expect($business->refresh()->trial_ends_at)->not->toBeNull();
    Notification::assertSentTo($owner, TrialStartedNotification::class);
});

test('paid plan activation makes owner active without superadmin review', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
        'phone' => '0911223344',
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'access_mode' => BusinessAccessMode::Onboarding,
    ]);
    $subscription = Subscription::factory()->create([
        'status' => RecordStatus::Active,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->post(route('onboarding.plans.activate', $subscription))
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'subscription_id' => $subscription->id,
        'access_mode' => BusinessAccessMode::Active->value,
    ]);
});
