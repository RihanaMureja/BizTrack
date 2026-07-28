<?php

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\User;
use App\Notifications\BusinessApprovedNotification;
use Illuminate\Support\Facades\Notification;

test('guest is redirected away from business profile', function () {
    $this->get(route('business.profile'))
        ->assertRedirect(route('login'));
});

test('cashier cannot access owner business profile', function () {
    $cashier = User::factory()->create([
        'role' => Role::Cashier,
    ]);

    $this->actingAs($cashier)
        ->get(route('business.profile'))
        ->assertForbidden();
});

test('owner can create a business profile and receives approval notification', function () {
    Notification::fake();

    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $subscription = Subscription::factory()->create([
        'status' => RecordStatus::Active,
    ]);

    $this->actingAs($owner)
        ->post(route('business.profile.store'), [
            'business_name' => 'Merkato Fresh Mart',
            'business_type' => 'Retail',
            'subscription_id' => $subscription->id,
            'email' => 'hello@merkato.test',
            'phone' => '0911223344',
            'address' => 'Addis Ababa',
        ])
        ->assertRedirect(route('business.profile', absolute: false));

    $this->assertDatabaseHas('businesses', [
        'owner_id' => $owner->id,
        'subscription_id' => $subscription->id,
        'business_name' => 'Merkato Fresh Mart',
        'email' => 'hello@merkato.test',
    ]);

    expect($owner->refresh()->business_id)->not->toBeNull();

    Notification::assertSentTo($owner, BusinessApprovedNotification::class);
});

test('owner can update business profile without creating a duplicate business', function () {
    Notification::fake();

    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $subscription = Subscription::factory()->create([
        'status' => RecordStatus::Active,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'subscription_id' => $subscription->id,
        'business_name' => 'Old Name',
        'email' => 'old@example.test',
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->put(route('business.profile.update'), [
            'business_name' => 'New Name',
            'business_type' => 'Service',
            'subscription_id' => $subscription->id,
            'email' => 'new@example.test',
            'phone' => '0911223344',
            'address' => 'Bole',
        ])
        ->assertRedirect(route('business.profile', absolute: false));

    $this->assertDatabaseCount('businesses', 1);
    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'business_name' => 'New Name',
        'email' => 'new@example.test',
    ]);

    Notification::assertNothingSent();
});

test('business name is required', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $this->actingAs($owner)
        ->post(route('business.profile.store'), [
            'business_name' => '',
        ])
        ->assertSessionHasErrors('business_name');
});

test('business email must be unique', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    Business::factory()->create([
        'email' => 'taken@example.test',
    ]);

    $this->actingAs($owner)
        ->post(route('business.profile.store'), [
            'business_name' => 'Unique Shop',
            'email' => 'taken@example.test',
        ])
        ->assertSessionHasErrors('email');
});

test('subscription must be an active plan', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $inactiveSubscription = Subscription::factory()->create([
        'status' => RecordStatus::Inactive,
    ]);

    $this->actingAs($owner)
        ->post(route('business.profile.store'), [
            'business_name' => 'Inactive Plan Shop',
            'subscription_id' => $inactiveSubscription->id,
        ])
        ->assertSessionHasErrors('subscription_id');
});
