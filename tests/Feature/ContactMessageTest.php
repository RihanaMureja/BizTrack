<?php

use App\Enums\BusinessAccessMode;
use App\Enums\ContactMessageSource;
use App\Enums\ContactMessageStatus;
use App\Enums\NotificationCategory;
use App\Enums\NotificationType;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\ContactMessage;
use App\Models\Notification;
use App\Models\User;

function contactSuperAdmin(): User
{
    return User::factory()->create([
        'role' => Role::SuperAdmin,
        'status' => RecordStatus::Active,
    ]);
}

function contactOwnerContext(): array
{
    $owner = User::factory()->create([
        'role' => Role::Owner,
        'status' => RecordStatus::Active,
    ]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Active,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('public visitor can submit contact message and notify super admin', function () {
    $admin = contactSuperAdmin();

    $this->post(route('contact.store'), [
        'full_name' => 'Public Visitor',
        'email' => 'visitor@example.com',
        'phone' => '+251911111111',
        'subject' => 'Pricing question',
        'message' => 'I want to understand which BizTrack plan fits my shop.',
    ])->assertRedirect();

    $this->assertDatabaseHas('contact_messages', [
        'full_name' => 'Public Visitor',
        'email' => 'visitor@example.com',
        'source' => ContactMessageSource::Landing->value,
        'status' => ContactMessageStatus::New->value,
    ]);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'type' => NotificationType::PlatformSupportMessage->value,
        'category' => NotificationCategory::Support->value,
    ]);
});

test('contact form validates required data and blocks honeypot spam', function () {
    $this->post(route('contact.store'), [
        'full_name' => '',
        'email' => 'not-an-email',
        'subject' => '',
        'message' => 'short',
        'website' => 'bot-field',
    ])->assertSessionHasErrors(['full_name', 'email', 'subject', 'message', 'website']);
});

test('business owner can send support message tied to business', function () {
    $admin = contactSuperAdmin();
    [$owner, $business] = contactOwnerContext();

    $this->actingAs($owner)
        ->post(route('support.store'), [
            'full_name' => $owner->name,
            'email' => $owner->email,
            'subject' => 'Inventory issue',
            'message' => 'The inventory page is not showing my latest restock correctly.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('contact_messages', [
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'source' => ContactMessageSource::OwnerSupport->value,
        'status' => ContactMessageStatus::New->value,
    ]);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $admin->id,
        'business_id' => $business->id,
        'type' => NotificationType::PlatformSupportMessage->value,
        'category' => NotificationCategory::Support->value,
    ]);
});

test('cashier cannot use owner support channel', function () {
    $cashier = User::factory()->create(['role' => Role::Cashier]);

    $this->actingAs($cashier)
        ->get(route('support.index'))
        ->assertForbidden();
});

test('super admin can view and resolve inbox messages', function () {
    $admin = contactSuperAdmin();
    $message = ContactMessage::factory()->create([
        'source' => ContactMessageSource::OwnerSupport,
        'status' => ContactMessageStatus::New,
        'subject' => 'Checkout problem',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.inbox.index', ['source' => ContactMessageSource::OwnerSupport->value]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/inbox/index')
            ->where('messages.total', 1)
            ->where('messages.data.0.subject', 'Checkout problem'));

    $this->actingAs($admin)
        ->post(route('admin.inbox.read', $message))
        ->assertRedirect();

    expect($message->refresh()->status)->toBe(ContactMessageStatus::Read);

    $this->actingAs($admin)
        ->post(route('admin.inbox.resolve', $message))
        ->assertRedirect();

    expect($message->refresh()->status)->toBe(ContactMessageStatus::Resolved)
        ->and($message->resolved_at)->not->toBeNull();
});

test('non super admin cannot view platform inbox', function () {
    [$owner] = contactOwnerContext();

    $this->actingAs($owner)
        ->get(route('admin.inbox.index'))
        ->assertForbidden();
});
