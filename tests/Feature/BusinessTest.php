<?php

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\BusinessVerificationDocument;
use App\Models\BusinessVerificationReview;
use App\Models\Subscription;
use App\Models\User;
use App\Notifications\BusinessApprovedNotification;
use App\Notifications\BusinessVerificationRejectedNotification;
use App\Notifications\BusinessVerificationResubmissionRequestedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

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

function businessPayload(array $overrides = []): array
{
    return [
        'business_name' => 'Merkato Fresh Mart',
        'business_type' => 'Retail',
        'email' => 'hello@merkato.test',
        'phone' => '0911223344',
        'address' => 'Addis Ababa',
        'national_id_fan_number' => 'FAN-123456',
        'national_id_photo' => UploadedFile::fake()->image('national-id.jpg'),
        'trade_license' => UploadedFile::fake()->create('trade-license.pdf', 120, 'application/pdf'),
        'tin_certificate' => UploadedFile::fake()->create('tin-certificate.pdf', 120, 'application/pdf'),
        'is_vat_registered' => false,
        'has_physical_shop' => false,
        ...$overrides,
    ];
}

test('owner can submit a business profile for review without receiving approval notification', function () {
    Notification::fake();
    Storage::fake('public');

    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $subscription = Subscription::factory()->create([
        'status' => RecordStatus::Active,
    ]);

    $this->actingAs($owner)
        ->post(route('business.profile.store'), businessPayload([
            'subscription_id' => $subscription->id,
        ]))
        ->assertRedirect(route('business.profile', absolute: false));

    $this->assertDatabaseHas('businesses', [
        'owner_id' => $owner->id,
        'subscription_id' => $subscription->id,
        'business_name' => 'Merkato Fresh Mart',
        'email' => 'hello@merkato.test',
        'status' => RecordStatus::PendingReview->value,
        'national_id_fan_number' => 'FAN-123456',
    ]);

    $business = Business::firstWhere('owner_id', $owner->id);
    expect($owner->refresh()->business_id)->not->toBeNull()
        ->and($business?->national_id_photo_path)->not->toBeNull()
        ->and($business?->trade_license_path)->not->toBeNull()
        ->and($business?->tin_certificate_path)->not->toBeNull();

    expect(BusinessVerificationDocument::query()->where('business_id', $business->id)->count())->toBe(3);

    Notification::assertNothingSent();
});

test('owner can update business profile without creating a duplicate business', function () {
    Notification::fake();

    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $subscription = Subscription::factory()->create([
        'status' => RecordStatus::Active->value,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'subscription_id' => $subscription->id,
        'business_name' => 'Old Name',
        'email' => 'old@example.test',
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->put(route('business.profile.update'), businessPayload([
            'business_name' => 'New Name',
            'business_type' => 'Service',
            'subscription_id' => $subscription->id,
            'email' => 'new@example.test',
            'phone' => '0911223344',
            'address' => 'Bole',
        ]))
        ->assertRedirect(route('business.profile', absolute: false));

    $this->assertDatabaseCount('businesses', 1);
    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'business_name' => 'New Name',
        'email' => 'new@example.test',
    ]);

    Notification::assertNothingSent();
});

test('owner cannot access business modules until business is approved', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::PendingReview,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->get(route('products.index'))
        ->assertRedirect(route('business.profile', absolute: false));
});

test('owner is redirected from dashboard to verification until business is approved', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::PendingReview,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertRedirect(route('business.profile', absolute: false));
});

test('approved owner can access dashboard', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk();
});

test('super admin approval activates the business and notifies the owner', function () {
    Notification::fake();

    $superAdmin = User::factory()->create([
        'role' => Role::SuperAdmin,
    ]);

    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::PendingReview,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($superAdmin)
        ->post(route('admin.businesses.approve', $business))
        ->assertRedirect();

    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'status' => RecordStatus::Active,
    ]);

    Notification::assertSentTo($owner, BusinessApprovedNotification::class);
    expect(BusinessVerificationReview::query()->where('business_id', $business->id)->where('decision', 'approved')->exists())->toBeTrue();
});

test('super admin can view business verification review page', function () {
    $superAdmin = User::factory()->create([
        'role' => Role::SuperAdmin,
    ]);

    $business = Business::factory()->create([
        'status' => RecordStatus::PendingReview,
    ]);

    BusinessVerificationDocument::create([
        'business_id' => $business->id,
        'type' => 'national_id',
        'label' => 'National ID photo',
        'path' => 'business-verifications/national-id.jpg',
        'status' => RecordStatus::PendingReview,
    ]);

    $this->actingAs($superAdmin)
        ->get(route('admin.business-verifications.show', $business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/business-verifications/show')
            ->where('business.id', $business->id)
            ->has('business.verification_documents', 1));
});

test('super admin can reject business verification with a reason', function () {
    Notification::fake();

    $superAdmin = User::factory()->create([
        'role' => Role::SuperAdmin,
    ]);
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::PendingReview,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($superAdmin)
        ->post(route('admin.business-verifications.review', $business), [
            'decision' => 'rejected',
            'reason' => 'Trade license is expired.',
        ])
        ->assertRedirect(route('admin.business-verifications.show', $business, absolute: false));

    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'status' => RecordStatus::Rejected->value,
    ]);
    $this->assertDatabaseHas('business_verification_reviews', [
        'business_id' => $business->id,
        'decision' => 'rejected',
        'reason' => 'Trade license is expired.',
    ]);

    Notification::assertSentTo($owner, BusinessVerificationRejectedNotification::class);
});

test('rejection and resubmission decisions require a reason', function () {
    $superAdmin = User::factory()->create([
        'role' => Role::SuperAdmin,
    ]);
    $business = Business::factory()->create([
        'status' => RecordStatus::PendingReview,
    ]);

    $this->actingAs($superAdmin)
        ->post(route('admin.business-verifications.review', $business), [
            'decision' => 'resubmission_required',
            'reason' => '',
        ])
        ->assertSessionHasErrors('reason');
});

test('super admin can request verification resubmission and owner can resubmit documents', function () {
    Notification::fake();
    Storage::fake('public');

    $superAdmin = User::factory()->create([
        'role' => Role::SuperAdmin,
    ]);
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::PendingReview,
        'national_id_photo_path' => 'business-verifications/old-id.jpg',
        'trade_license_path' => 'business-verifications/old-license.pdf',
        'tin_certificate_path' => 'business-verifications/old-tin.pdf',
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($superAdmin)
        ->post(route('admin.business-verifications.review', $business), [
            'decision' => 'resubmission_required',
            'reason' => 'National ID image is unclear.',
        ])
        ->assertRedirect(route('admin.business-verifications.show', $business, absolute: false));

    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'status' => RecordStatus::ResubmissionRequired->value,
    ]);
    Notification::assertSentTo($owner, BusinessVerificationResubmissionRequestedNotification::class);

    $this->actingAs($owner)
        ->put(route('business.profile.update'), businessPayload([
            'email' => 'resubmitted@example.test',
            'national_id_photo' => UploadedFile::fake()->image('clear-national-id.jpg'),
        ]))
        ->assertRedirect(route('business.profile', absolute: false));

    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'status' => RecordStatus::PendingReview->value,
        'email' => 'resubmitted@example.test',
    ]);

    expect(BusinessVerificationDocument::query()->where('business_id', $business->id)->where('type', 'national_id')->first()?->path)
        ->toContain('business-verifications');
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

test('vat certificate is required only for vat registered businesses', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $this->actingAs($owner)
        ->post(route('business.profile.store'), businessPayload([
            'is_vat_registered' => true,
            'vat_certificate' => null,
        ]))
        ->assertSessionHasErrors('vat_certificate');
});

test('rental agreement is required only for physical shops', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $this->actingAs($owner)
        ->post(route('business.profile.store'), businessPayload([
            'has_physical_shop' => true,
            'rental_agreement' => null,
        ]))
        ->assertSessionHasErrors('rental_agreement');
});
