<?php

use App\Enums\BusinessPermissionKey;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\BusinessPermission;
use App\Models\BusinessRole;
use App\Models\Subscription;
use App\Models\User;

function roleOwnerWithBusiness(): array
{
    $subscription = Subscription::factory()->create([
        'status' => RecordStatus::Active,
        'max_cashiers' => 5,
    ]);
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'subscription_id' => $subscription->id,
        'status' => RecordStatus::Active,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function seedBusinessPermissions(): void
{
    foreach (BusinessPermissionKey::cases() as $permission) {
        BusinessPermission::query()->updateOrCreate(
            ['key' => $permission->value],
            ['name' => $permission->label(), 'group' => $permission->group()],
        );
    }
}

test('owner can view business roles page with default role', function () {
    seedBusinessPermissions();
    [$owner, $business] = roleOwnerWithBusiness();

    $this->actingAs($owner)
        ->get(route('business-roles.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('roles/index')
            ->where('roles.total', 1)
            ->where('roles.data.0.name', 'Cashier')
            ->has('permissions'));

    expect($business->roles()->where('is_default', true)->exists())->toBeTrue();
});

test('owner can create a custom employee role with permissions', function () {
    seedBusinessPermissions();
    [$owner, $business] = roleOwnerWithBusiness();
    $permissions = BusinessPermission::query()
        ->whereIn('key', [BusinessPermissionKey::ViewDashboard->value, BusinessPermissionKey::ManageInventory->value])
        ->pluck('id')
        ->all();

    $this->actingAs($owner)
        ->post(route('business-roles.store'), [
            'name' => 'Inventory Staff',
            'description' => 'Handles stock only',
            'is_default' => false,
            'permission_ids' => $permissions,
        ])
        ->assertRedirect();

    $role = BusinessRole::query()->where('business_id', $business->id)->where('name', 'Inventory Staff')->firstOrFail();

    expect($role->permissions()->count())->toBe(2);
});

test('owner can assign custom role when creating cashier', function () {
    seedBusinessPermissions();
    [$owner, $business] = roleOwnerWithBusiness();
    $role = BusinessRole::factory()->for($business)->create(['name' => 'Sales Clerk']);

    $this->actingAs($owner)
        ->post(route('cashiers.store'), [
            'first_name' => 'Sara',
            'last_name' => 'Sales',
            'name' => 'Sara Sales',
            'email' => 'sara.sales@example.test',
            'phone' => '0911000000',
            'status' => RecordStatus::Active->value,
            'business_role_id' => $role->id,
            'password' => 'StrongTemp#123',
            'password_confirmation' => 'StrongTemp#123',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'email' => 'sara.sales@example.test',
        'business_id' => $business->id,
        'business_role_id' => $role->id,
    ]);
});

test('employee sidebar follows assigned permissions', function () {
    seedBusinessPermissions();
    [$owner, $business] = roleOwnerWithBusiness();
    $role = BusinessRole::factory()->for($business)->create(['name' => 'Payment Clerk']);
    $role->permissions()->sync(BusinessPermission::query()
        ->whereIn('key', [BusinessPermissionKey::ViewDashboard->value, BusinessPermissionKey::ManagePayments->value])
        ->pluck('id'));

    $employee = User::factory()->create([
        'business_id' => $business->id,
        'business_role_id' => $role->id,
        'role' => Role::Cashier,
        'must_reset_password' => false,
    ]);

    $this->actingAs($employee)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('navigation.0.title', 'Dashboard')
            ->where('navigation.1.title', 'Payments')
            ->where('navigation.2.title', 'Profile')
            ->missing('navigation.3.title'));
});

test('employee cannot access module without permission', function () {
    seedBusinessPermissions();
    [, $business] = roleOwnerWithBusiness();
    $role = BusinessRole::factory()->for($business)->create(['name' => 'Report Viewer']);
    $role->permissions()->sync(BusinessPermission::query()
        ->whereIn('key', [BusinessPermissionKey::ViewDashboard->value, BusinessPermissionKey::ViewReports->value])
        ->pluck('id'));

    $employee = User::factory()->create([
        'business_id' => $business->id,
        'business_role_id' => $role->id,
        'role' => Role::Cashier,
        'must_reset_password' => false,
    ]);

    $this->actingAs($employee)
        ->get(route('payments.index'))
        ->assertForbidden();
});
