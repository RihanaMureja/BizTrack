<?php

use App\Enums\BusinessPermissionKey;
use App\Enums\NotificationType;
use App\Enums\Role;
use App\Models\Business;
use App\Models\BusinessPermission;
use App\Models\BusinessRole;
use App\Models\Notification;
use App\Models\User;

function rbacNavigationBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function rbacNavigationPermission(BusinessPermissionKey $permission): BusinessPermission
{
    return BusinessPermission::query()->updateOrCreate(
        ['key' => $permission->value],
        [
            'name' => $permission->label(),
            'group' => $permission->group(),
            'description' => 'Test permission for '.$permission->label().'.',
        ],
    );
}

test('owner sidebar does not include notifications but header unread count is shared', function () {
    [$owner, $business] = rbacNavigationBusinessContext();
    Notification::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'type' => NotificationType::LowStock,
        'is_read' => false,
    ]);

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('notificationSummary.unreadCount', 1)
            ->where('navigation', fn ($navigation): bool => ! collect($navigation)
                ->flatMap(fn (array $group): array => $group['items'])
                ->pluck('title')
                ->contains('Notifications')));
});

test('cashier with notification permission can open notifications without sidebar entry', function () {
    [, $business] = rbacNavigationBusinessContext();
    $role = BusinessRole::factory()->for($business)->create(['name' => 'Notifier']);
    $role->permissions()->sync([
        rbacNavigationPermission(BusinessPermissionKey::ViewDashboard)->id,
        rbacNavigationPermission(BusinessPermissionKey::ViewNotifications)->id,
    ]);
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'business_role_id' => $role->id,
        'role' => Role::Cashier,
        'must_reset_password' => false,
    ]);

    $this->actingAs($cashier)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('navigation', fn ($navigation): bool => ! collect($navigation)
                ->flatMap(fn (array $group): array => $group['items'])
                ->pluck('title')
                ->contains('Notifications')));

    $this->actingAs($cashier)
        ->get(route('notifications.index'))
        ->assertOk();
});

test('view notifications permission still protects notifications route', function () {
    [, $business] = rbacNavigationBusinessContext();
    $role = BusinessRole::factory()->for($business)->create(['name' => 'Dashboard Only']);
    $role->permissions()->sync([
        rbacNavigationPermission(BusinessPermissionKey::ViewDashboard)->id,
    ]);
    $cashier = User::factory()->create([
        'business_id' => $business->id,
        'business_role_id' => $role->id,
        'role' => Role::Cashier,
        'must_reset_password' => false,
    ]);

    $this->actingAs($cashier)
        ->get(route('notifications.index'))
        ->assertForbidden();
});
