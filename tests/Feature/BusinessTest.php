<?php

use App\Enums\BusinessAccessMode;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\BusinessVerificationDocument;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

test('guest is redirected away from business profile', function () {
    $this->get(route('settings.business.edit'))
        ->assertRedirect(route('login'));
});

test('cashier cannot access owner business profile', function () {
    $cashier = User::factory()->create([
        'role' => Role::Cashier,
    ]);

    $this->actingAs($cashier)
        ->get(route('settings.business.edit'))
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

test('owner can create an onboarding business profile without superadmin approval', function () {
    Notification::fake();
    Storage::fake('public');

    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $this->actingAs($owner)
        ->post(route('settings.business.store'), businessPayload())
        ->assertRedirect(route('onboarding.verify-phone', absolute: false));

    $business = Business::firstWhere('owner_id', $owner->id);

    $this->assertDatabaseHas('businesses', [
        'owner_id' => $owner->id,
        'business_name' => 'Merkato Fresh Mart',
        'email' => 'hello@merkato.test',
        'status' => RecordStatus::Active->value,
        'access_mode' => BusinessAccessMode::Onboarding->value,
        'national_id_fan_number' => 'FAN-123456',
    ]);

    expect($owner->refresh()->business_id)->toBe($business?->id)
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

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'business_name' => 'Old Name',
        'email' => 'old@example.test',
        'access_mode' => BusinessAccessMode::Onboarding,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->put(route('settings.business.update'), businessPayload([
            'business_name' => 'New Name',
            'business_type' => 'Service',
            'email' => 'new@example.test',
            'phone' => '0911223344',
            'address' => 'Bole',
        ]))
        ->assertRedirect(route('onboarding.verify-phone', absolute: false));

    $this->assertDatabaseCount('businesses', 1);
    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
        'business_name' => 'New Name',
        'email' => 'new@example.test',
        'access_mode' => BusinessAccessMode::Onboarding->value,
    ]);

    Notification::assertNothingSent();
});

test('owner cannot access business modules until trial or paid access is active', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Onboarding,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->get(route('products.index'))
        ->assertRedirect(route('onboarding.index', absolute: false));
});

test('trial owner can access dashboard', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Trial,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk();
});

test('paid owner can access dashboard', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Active,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk();
});

test('base business documents are optional during profile setup', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $this->actingAs($owner)
        ->post(route('settings.business.store'), businessPayload([
            'national_id_fan_number' => null,
            'national_id_photo' => null,
            'trade_license' => null,
            'tin_certificate' => null,
            'is_vat_registered' => false,
            'vat_certificate' => null,
            'has_physical_shop' => false,
            'rental_agreement' => null,
        ]))
        ->assertSessionDoesntHaveErrors([
            'national_id_fan_number',
            'national_id_photo',
            'trade_license',
            'tin_certificate',
            'vat_certificate',
            'rental_agreement',
        ]);
});

test('vat certificate is required only when business is vat registered', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $this->actingAs($owner)
        ->post(route('settings.business.store'), businessPayload([
            'is_vat_registered' => true,
            'vat_certificate' => null,
        ]))
        ->assertSessionHasErrors('vat_certificate');
});

test('rental agreement is required only when business has a physical shop', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $this->actingAs($owner)
        ->post(route('settings.business.store'), businessPayload([
            'has_physical_shop' => true,
            'rental_agreement' => null,
        ]))
        ->assertSessionHasErrors('rental_agreement');
});

test('business email must be unique', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    Business::factory()->create([
        'email' => 'taken@example.test',
    ]);

    $this->actingAs($owner)
        ->post(route('settings.business.store'), [
            'business_name' => 'Unique Shop',
            'email' => 'taken@example.test',
        ])
        ->assertSessionHasErrors('email');
});

test('subscription must be an active plan when selected', function () {
    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $inactiveSubscription = Subscription::factory()->create([
        'status' => RecordStatus::Inactive,
    ]);

    $this->actingAs($owner)
        ->post(route('settings.business.store'), [
            'business_name' => 'Inactive Plan Shop',
            'subscription_id' => $inactiveSubscription->id,
        ])
        ->assertSessionHasErrors('subscription_id');
});
