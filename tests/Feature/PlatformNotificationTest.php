<?php

use App\Enums\BusinessAccessMode;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Enums\NotificationType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Events\PaymentCompleted;
use App\Models\Business;
use App\Models\Notification as AppNotification;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\Subscription;
use App\Models\User;
use App\Services\OnboardingService;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Laravel\Fortify\Features;

function platformAdmin(): User
{
    return User::factory()->create([
        'role' => Role::SuperAdmin,
        'status' => RecordStatus::Active,
    ]);
}

function platformBusinessContext(array $businessOverrides = []): array
{
    $owner = User::factory()->create([
        'role' => Role::Owner,
        'name' => 'Aster Owner',
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'business_name' => 'Aster Perfumes',
        ...$businessOverrides,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('super admin is notified when a user signs up', function () {
    $this->skipUnlessFortifyHas(Features::registration());
    Notification::fake();

    $admin = platformAdmin();

    $this->post(route('register.store'), [
        'first_name' => 'New',
        'last_name' => 'Owner',
        'email' => 'new-owner@example.test',
        'phone' => '0911223344',
        'password' => 'StrongPass#123',
        'password_confirmation' => 'StrongPass#123',
    ])->assertRedirect(route('verification.notice', absolute: false));

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'type' => NotificationType::PlatformUserSignup->value,
        'title' => 'New account signup',
    ]);
});

test('super admin is notified when a user verifies email', function () {
    $this->skipUnlessFortifyHas(Features::emailVerification());

    $admin = platformAdmin();
    $owner = User::factory()->unverified()->create([
        'role' => Role::Owner,
        'name' => 'Verified Owner',
        'email' => 'verified-owner@example.test',
    ]);

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $owner->id, 'hash' => sha1($owner->email)],
    );

    $this->actingAs($owner)->get($verificationUrl);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'type' => NotificationType::PlatformEmailVerified->value,
        'title' => 'Email verified',
    ]);
});

test('super admin is notified when onboarding is completed with a trial', function () {
    Notification::fake();

    $admin = platformAdmin();
    [, $business] = platformBusinessContext([
        'access_mode' => BusinessAccessMode::Onboarding,
        'subscription_id' => null,
        'onboarding_completed_at' => null,
    ]);

    app(OnboardingService::class)->startTrial($business);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'business_id' => $business->id,
        'type' => NotificationType::PlatformOnboardingCompleted->value,
        'title' => 'Onboarding completed',
    ]);
});

test('super admin is notified when a paid subscription is activated or changed', function () {
    $admin = platformAdmin();
    [, $business] = platformBusinessContext([
        'access_mode' => BusinessAccessMode::Trial,
        'subscription_id' => null,
        'onboarding_completed_at' => now(),
    ]);
    $subscription = Subscription::factory()->create([
        'name' => 'Growth',
        'status' => RecordStatus::Active,
    ]);

    app(OnboardingService::class)->activatePaidPlan($business, $subscription);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'business_id' => $business->id,
        'type' => NotificationType::PlatformSubscriptionChanged->value,
        'title' => 'Subscription activated',
    ]);
});

test('super admin is notified when a payment is completed', function () {
    Notification::fake();

    $admin = platformAdmin();
    [$owner, $business] = platformBusinessContext();
    $sale = Sale::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'invoice_number' => 'INV-PLATFORM-001',
    ]);
    $payment = Payment::factory()->create([
        'business_id' => $business->id,
        'sale_id' => $sale->id,
        'user_id' => $owner->id,
        'payment_number' => 'PAY-PLATFORM-001',
        'method' => PaymentMethod::Cash,
        'status' => PaymentStatus::Completed,
        'amount' => 250,
    ]);

    PaymentCompleted::dispatch($payment->load(['business.owner', 'sale', 'user']));

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'business_id' => $business->id,
        'type' => NotificationType::PlatformPaymentCompleted->value,
        'title' => 'Payment completed',
    ]);

    expect(AppNotification::query()
        ->where('user_id', $admin->id)
        ->where('type', NotificationType::PlatformPaymentCompleted->value)
        ->where('message', 'like', '%250.00 ETB%')
        ->exists())->toBeTrue();
});

test('super admin can manage the platform notification center', function () {
    $admin = platformAdmin();
    [, $business] = platformBusinessContext();
    $notification = AppNotification::create([
        'user_id' => $admin->id,
        'business_id' => $business->id,
        'type' => NotificationType::PlatformSubscriptionChanged,
        'category' => NotificationCategory::Subscription,
        'priority' => NotificationPriority::High,
        'title' => 'Subscription changed',
        'message' => 'Aster Perfumes changed to the Growth plan.',
        'action_url' => '/admin/subscriptions/assignments?search=Aster',
        'dedupe_key' => 'platform:test-subscription-alert',
        'is_read' => false,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.notifications.index', [
            'category' => NotificationCategory::Subscription->value,
            'priority' => NotificationPriority::High->value,
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/notifications/index')
            ->where('unreadCount', 1)
            ->where('notifications.data.0.title', 'Subscription changed')
            ->where('notifications.data.0.category', NotificationCategory::Subscription->value)
            ->where('notifications.data.0.priority', NotificationPriority::High->value));

    $this->actingAs($admin)
        ->post(route('admin.notifications.read', $notification))
        ->assertRedirect();

    expect($notification->refresh()->is_read)->toBeTrue();

    $this->actingAs($admin)
        ->post(route('admin.notifications.dismiss', $notification))
        ->assertRedirect();

    expect($notification->refresh()->dismissed_at)->not->toBeNull();
});
