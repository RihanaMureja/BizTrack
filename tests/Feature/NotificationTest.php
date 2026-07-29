<?php

use App\Enums\NotificationType;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Notification;
use App\Models\Sale;
use App\Models\User;
use App\Notifications\DailySalesNotification;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Notification as NotificationFake;

function notificationBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('guests are redirected from notifications', function () {
    $this->get(route('notifications.index'))->assertRedirect(route('login'));
});

test('owner can list business notifications and unread count', function () {
    [$owner, $business] = notificationBusinessContext();
    Notification::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'title' => 'Low stock: Sugar',
        'type' => NotificationType::LowStock,
        'is_read' => false,
    ]);
    Notification::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'type' => NotificationType::PaymentReceived,
        'is_read' => true,
    ]);

    $this->actingAs($owner)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->where('notifications.total', 2)
            ->where('unreadCount', 1)
            ->has('types', 5));
});

test('notifications can be filtered by type and read state', function () {
    [$owner, $business] = notificationBusinessContext();
    Notification::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'type' => NotificationType::LowStock,
        'is_read' => false,
    ]);
    Notification::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'type' => NotificationType::PaymentReceived,
        'is_read' => false,
    ]);

    $this->actingAs($owner)
        ->get(route('notifications.index', ['type' => NotificationType::LowStock->value, 'read' => 'false']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('notifications.total', 1)
            ->where('notifications.data.0.type', NotificationType::LowStock->value));
});

test('user can mark one notification as read', function () {
    [$owner, $business] = notificationBusinessContext();
    $notification = Notification::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'is_read' => false,
    ]);

    $this->actingAs($owner)
        ->post(route('notifications.read', $notification))
        ->assertRedirect();

    expect($notification->refresh()->is_read)->toBeTrue();
});

test('user can mark all accessible notifications as read', function () {
    [$owner, $business] = notificationBusinessContext();
    Notification::factory()->count(3)->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'is_read' => false,
    ]);

    $this->actingAs($owner)
        ->post(route('notifications.mark-all-read'))
        ->assertRedirect();

    expect(Notification::query()->where('business_id', $business->id)->where('is_read', false)->count())->toBe(0);
});

test('cashier can see business notifications', function () {
    [$owner, $business] = notificationBusinessContext();
    $cashier = User::factory()->create(['role' => Role::Cashier, 'business_id' => $business->id]);
    Notification::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'is_read' => false,
    ]);

    $this->actingAs($cashier)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('notifications.total', 1));
});

test('user cannot mark another business notification as read', function () {
    [$owner] = notificationBusinessContext();
    [, $otherBusiness] = notificationBusinessContext();
    $notification = Notification::factory()->create(['business_id' => $otherBusiness->id]);

    $this->actingAs($owner)
        ->post(route('notifications.read', $notification))
        ->assertForbidden();
});

test('daily sales summary creates in-app and mail notifications', function () {
    NotificationFake::fake();
    [$owner, $business] = notificationBusinessContext();
    Sale::factory()->create(['business_id' => $business->id, 'grand_total' => 350, 'sold_at' => now()]);
    Sale::factory()->create(['business_id' => $business->id, 'grand_total' => 125, 'sold_at' => now()]);
    Sale::factory()->create(['business_id' => $business->id, 'grand_total' => 900, 'sold_at' => now()->subDay()]);

    $notification = app(NotificationService::class)->createDailySalesSummary($business);

    expect($notification)->not->toBeNull()
        ->and($notification->type)->toBe(NotificationType::DailySales)
        ->and($notification->message)->toContain('2 sales completed today')
        ->and($notification->message)->toContain('475.00 ETB');

    NotificationFake::assertSentTo($owner, DailySalesNotification::class);
});
