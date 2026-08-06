<?php

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\BusinessRole;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use App\Events\CashierCreated;

function cashierOwnerWithBusiness(int $maxCashiers = 3): array
{
    $subscription = Subscription::factory()->create([
        'max_cashiers' => $maxCashiers,
        'status' => RecordStatus::Active,
    ]);
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'subscription_id' => $subscription->id,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business, $subscription];
}

function validCashierPayload(array $overrides = []): array
{
    return [
        'first_name' => 'Liya',
        'last_name' => 'Cashier',
        'name' => 'Liya Cashier',
        'email' => 'liya.cashier@biztrack.test',
        'phone' => '0911555666',
        'status' => RecordStatus::Active->value,
        'password' => 'StrongTemp#123',
        'password_confirmation' => 'StrongTemp#123',
        ...$overrides,
    ];
}

test('guests are redirected to login', function () {
    $this->get(route('cashiers.index'))->assertRedirect(route('login'));
});

test('cashiers cannot manage cashier accounts', function () {
    [$owner, $business] = cashierOwnerWithBusiness();
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($cashier)
        ->get(route('cashiers.index'))
        ->assertForbidden();
});

test('owner can view cashier list', function () {
    [$owner, $business] = cashierOwnerWithBusiness();
    User::factory()->count(2)->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($owner)
        ->get(route('cashiers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cashiers/index')
            ->where('cashiers.total', 2)
        );
});

test('owner can create cashier and role is assigned', function () {
    Event::fake([CashierCreated::class]);
    [$owner, $business] = cashierOwnerWithBusiness();

    $this->actingAs($owner)
        ->post(route('cashiers.store'), validCashierPayload())
        ->assertRedirect();

    $cashier = User::query()->where('email', 'liya.cashier@biztrack.test')->firstOrFail();

    expect($cashier->business_id)->toBe($business->id)
        ->and($cashier->role)->toBe(Role::Cashier)
        ->and($cashier->status)->toBe(RecordStatus::Active)
        ->and($cashier->must_reset_password)->toBeTrue()
        ->and($cashier->temporary_password_expires_at)->not->toBeNull();

    Event::assertDispatched(CashierCreated::class);
});

test('cashier count is limited by subscription', function () {
    [$owner, $business] = cashierOwnerWithBusiness(maxCashiers: 1);
    User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($owner)
        ->post(route('cashiers.store'), validCashierPayload())
        ->assertSessionHasErrors('cashiers');
});

test('owner can update their cashier', function () {
    [$owner, $business] = cashierOwnerWithBusiness();
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($owner)
        ->put(route('cashiers.update', $cashier), validCashierPayload([
            'name' => 'Updated Cashier',
            'email' => $cashier->email,
            'password' => null,
            'password_confirmation' => null,
        ]))
        ->assertRedirect();

    expect($cashier->refresh()->name)->toBe('Updated Cashier');
});

test('owner can change an existing employee custom role', function () {
    [$owner, $business] = cashierOwnerWithBusiness();
    $oldRole = BusinessRole::factory()->create([
        'business_id' => $business->id,
        'name' => 'Cashier',
    ]);
    $newRole = BusinessRole::factory()->create([
        'business_id' => $business->id,
        'name' => 'Inventory Tracker',
    ]);
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'business_role_id' => $oldRole->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($owner)
        ->put(route('cashiers.update', $cashier), validCashierPayload([
            'email' => $cashier->email,
            'business_role_id' => $newRole->id,
            'password' => null,
            'password_confirmation' => null,
        ]))
        ->assertRedirect();

    expect($cashier->refresh()->business_role_id)->toBe($newRole->id);
});

test('owner cannot update another business cashier', function () {
    [$owner] = cashierOwnerWithBusiness();
    [, $otherBusiness] = cashierOwnerWithBusiness();
    $otherCashier = User::factory()->create([
        'business_id' => $otherBusiness->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($owner)
        ->put(route('cashiers.update', $otherCashier), validCashierPayload([
            'email' => $otherCashier->email,
            'password' => null,
            'password_confirmation' => null,
        ]))
        ->assertForbidden();
});

test('owner can deactivate cashier', function () {
    [$owner, $business] = cashierOwnerWithBusiness();
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
        'status' => RecordStatus::Active,
    ]);

    $this->actingAs($owner)
        ->post(route('cashiers.deactivate', $cashier))
        ->assertRedirect();

    expect($cashier->refresh()->status)->toBe(RecordStatus::Inactive);
});

test('owner can reset cashier password', function () {
    [$owner, $business] = cashierOwnerWithBusiness();
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);
    $oldPassword = $cashier->password;

    $this->actingAs($owner)
        ->post(route('cashiers.reset-password', $cashier))
        ->assertRedirect();

    expect($cashier->refresh()->password)->not->toBe($oldPassword);
});

test('owner can delete cashier', function () {
    [$owner, $business] = cashierOwnerWithBusiness();
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($owner)
        ->delete(route('cashiers.destroy', $cashier))
        ->assertRedirect();

    $this->assertDatabaseMissing('users', ['id' => $cashier->id]);
});

test('cashier navigation stays restricted', function () {
    [$owner, $business] = cashierOwnerWithBusiness();
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);

    $this->actingAs($cashier)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('navigation.0.label', 'Workspace')
            ->where('navigation.0.items.0.title', 'Dashboard')
            ->where('navigation.1.label', 'Operations')
            ->where('navigation.1.items.0.title', 'Sales')
            ->where('navigation.1.items.1.title', 'Customers')
            ->where('navigation.1.items.2.title', 'Payments')
            ->where('navigation.2.label', 'Settings')
            ->where('navigation.2.items.0.title', 'Notifications')
            ->where('navigation.2.items.1.title', 'Profile')
            ->missing('navigation.3.label')
        );
});
