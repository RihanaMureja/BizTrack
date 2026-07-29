<?php

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\User;

function superAdminUser(): User
{
    return User::factory()->create(['role' => Role::SuperAdmin]);
}

function ownerBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('only super admins can access the admin dashboard', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));

    $owner = User::factory()->create(['role' => Role::Owner]);
    $this->actingAs($owner)->get(route('admin.dashboard'))->assertForbidden();

    $this->actingAs(superAdminUser())
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/dashboard')->has('stats', 4));
});

test('super admin can view and filter businesses', function () {
    $admin = superAdminUser();
    Business::factory()->create(['business_name' => 'Alpha Market', 'status' => RecordStatus::Active]);
    Business::factory()->create(['business_name' => 'Beta Shop', 'status' => RecordStatus::Inactive]);

    $this->actingAs($admin)
        ->get(route('admin.businesses.index', ['search' => 'Alpha', 'status' => RecordStatus::Active->value]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/businesses/index')
            ->where('businesses.total', 1)
            ->where('businesses.data.0.business_name', 'Alpha Market'));
});

test('super admin can approve deactivate and change business subscription', function () {
    $admin = superAdminUser();
    [, $business] = ownerBusinessContext();
    $subscription = Subscription::factory()->create();
    $business->forceFill(['status' => RecordStatus::Inactive])->save();

    $this->actingAs($admin)
        ->post(route('admin.businesses.approve', $business))
        ->assertRedirect();
    expect($business->refresh()->status)->toBe(RecordStatus::Active);

    $this->actingAs($admin)
        ->put(route('admin.businesses.subscription.update', $business), ['subscription_id' => $subscription->id])
        ->assertRedirect();
    expect($business->refresh()->subscription_id)->toBe($subscription->id);

    $this->actingAs($admin)
        ->post(route('admin.businesses.deactivate', $business))
        ->assertRedirect();
    expect($business->refresh()->status)->toBe(RecordStatus::Inactive);

    expect(AuditLog::where('action', 'business.approved')->exists())->toBeTrue()
        ->and(AuditLog::where('action', 'business.subscription_updated')->exists())->toBeTrue()
        ->and(AuditLog::where('action', 'business.deactivated')->exists())->toBeTrue();
});

test('super admin can manage users', function () {
    $admin = superAdminUser();
    $user = User::factory()->create(['role' => Role::Owner, 'status' => RecordStatus::Active]);

    $this->actingAs($admin)
        ->get(route('admin.users.index', ['role' => Role::Owner->value]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/users/index')->where('users.total', 1));

    $this->actingAs($admin)
        ->put(route('admin.users.update', $user), [
            'role' => Role::Cashier->value,
            'status' => RecordStatus::Inactive->value,
        ])
        ->assertRedirect();

    expect($user->refresh()->role)->toBe(Role::Cashier)
        ->and($user->status)->toBe(RecordStatus::Inactive)
        ->and(AuditLog::where('action', 'user.updated')->exists())->toBeTrue();
});

test('super admin can create update and deactivate subscription plans', function () {
    $admin = superAdminUser();

    $this->actingAs($admin)
        ->post(route('admin.subscriptions.store'), [
            'name' => 'Enterprise',
            'price' => 2500,
            'duration_months' => 1,
            'max_cashiers' => 30,
            'description' => 'Large teams',
            'status' => RecordStatus::Active->value,
        ])
        ->assertRedirect();

    $subscription = Subscription::where('name', 'Enterprise')->firstOrFail();

    $this->actingAs($admin)
        ->put(route('admin.subscriptions.update', $subscription), [
            'name' => 'Enterprise Plus',
            'price' => 3000,
            'duration_months' => 1,
            'max_cashiers' => 40,
            'description' => 'Larger teams',
            'status' => RecordStatus::Active->value,
        ])
        ->assertRedirect();

    $this->actingAs($admin)
        ->post(route('admin.subscriptions.deactivate', $subscription))
        ->assertRedirect();

    expect($subscription->refresh()->name)->toBe('Enterprise Plus')
        ->and($subscription->status)->toBe(RecordStatus::Inactive)
        ->and(AuditLog::where('action', 'subscription.created')->exists())->toBeTrue()
        ->and(AuditLog::where('action', 'subscription.updated')->exists())->toBeTrue()
        ->and(AuditLog::where('action', 'subscription.deactivated')->exists())->toBeTrue();
});

test('super admin can view role and permission overviews', function () {
    $admin = superAdminUser();

    $this->actingAs($admin)
        ->get(route('admin.roles.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/roles/index')->has('roles', 3));

    $this->actingAs($admin)
        ->get(route('admin.permissions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/permissions/index')->has('permissions'));
});

