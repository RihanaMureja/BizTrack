<?php

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\User;
use App\Services\BusinessService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Simulates the payload the Business Profile edit form sends via Inertia with
 * forceFormData (empty file inputs become empty strings, booleans become "0"/"1").
 */
/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function profileEditPayload(array $overrides = []): array
{
    return [
        'business_name' => 'Merkato Fresh Mart',
        'business_type' => 'Retail',
        'email' => 'hello@merkato.test',
        'phone' => '0911223344',
        'address' => 'Addis Ababa',
        'national_id_fan_number' => '',
        'national_id_photo' => '',
        'trade_license' => '',
        'tin_certificate' => '',
        'is_vat_registered' => '0',
        'vat_certificate' => '',
        'has_physical_shop' => '0',
        'rental_agreement' => '',
        'logo' => UploadedFile::fake()->image('logo.png', 400, 400),
        '_method' => 'put',
        ...$overrides,
    ];
}

test('owner can upload a business logo without re-submitting verification documents', function () {
    Storage::fake('public');

    $owner = User::factory()->create(['role' => Role::Owner]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'national_id_fan_number' => null,
        'national_id_photo_path' => null,
        'trade_license_path' => null,
        'tin_certificate_path' => null,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->put(route('business.profile.update'), profileEditPayload())
        ->assertRedirect(route('business.profile', absolute: false))
        ->assertSessionHasNoErrors();

    $business->refresh();

    expect($business->logo)->not->toBeNull();

    Storage::disk('public')->assertExists($business->logo);

    $this->get(route('businesses.logo', $business))->assertOk();
});

test('profile edit succeeds for a vat-registered or physical-shop business without re-uploading certificates already on file', function () {
    Storage::fake('public');

    $owner = User::factory()->create(['role' => Role::Owner]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'is_vat_registered' => true,
        'vat_certificate_path' => 'business-verifications/vat.pdf',
        'has_physical_shop' => true,
        'rental_agreement_path' => 'business-verifications/rental.pdf',
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    Storage::disk('public')->put('business-verifications/vat.pdf', 'vat-certificate');
    Storage::disk('public')->put('business-verifications/rental.pdf', 'rental-agreement');

    $this->actingAs($owner)
        ->put(route('business.profile.update'), profileEditPayload([
            'is_vat_registered' => '1',
            'vat_certificate' => '',
            'has_physical_shop' => '1',
            'rental_agreement' => '',
        ]))
        ->assertRedirect(route('business.profile', absolute: false))
        ->assertSessionHasNoErrors();

    expect($business->refresh()->logo)->not->toBeNull();
});

test('profile edit still requires a certificate when a registered business has none on file', function () {
    Storage::fake('public');

    $owner = User::factory()->create(['role' => Role::Owner]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'is_vat_registered' => true,
        'vat_certificate_path' => null,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->put(route('business.profile.update'), profileEditPayload([
            'is_vat_registered' => '1',
            'vat_certificate' => '',
        ]))
        ->assertSessionHasErrors('vat_certificate');
});

test('updating a profile keeps an approved business active', function () {
    Storage::fake('public');

    $owner = User::factory()->create(['role' => Role::Owner]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->put(route('business.profile.update'), profileEditPayload())
        ->assertRedirect(route('business.profile', absolute: false))
        ->assertSessionHasNoErrors();

    expect($business->refresh()->status)->toBe(RecordStatus::Active);
});

test('logo url is versioned and changes when the logo is replaced', function () {
    Storage::fake('public');

    $owner = User::factory()->create(['role' => Role::Owner]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'logo' => 'business-logos/first.png',
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    Storage::disk('public')->put('business-logos/first.png', 'first-logo');

    $service = app(BusinessService::class);
    $firstUrl = $service->logoUrl($business);

    expect($firstUrl)->toContain('?v=')->and($firstUrl)->toContain('first.png');

    $this->actingAs($owner)
        ->put(route('business.profile.update'), profileEditPayload([
            'logo' => UploadedFile::fake()->image('second.png', 300, 300),
        ]))
        ->assertRedirect(route('business.profile', absolute: false))
        ->assertSessionHasNoErrors();

    $secondUrl = $service->logoUrl($business->refresh());

    expect($secondUrl)->not->toBe($firstUrl);
});

test('logo upload rejects a file that is not an image', function () {
    Storage::fake('public');

    $owner = User::factory()->create(['role' => Role::Owner]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->put(route('business.profile.update'), profileEditPayload([
            'logo' => UploadedFile::fake()->create('logo.txt', 10),
        ]))
        ->assertSessionHasErrors(['logo' => 'The logo must be a valid image file (JPG, JPEG, PNG, or WEBP).']);
});

test('logo upload accepts a webp file', function () {
    Storage::fake('public');

    $owner = User::factory()->create(['role' => Role::Owner]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->put(route('business.profile.update'), profileEditPayload([
            'logo' => UploadedFile::fake()->image('logo.webp', 400, 400),
        ]))
        ->assertRedirect(route('business.profile', absolute: false))
        ->assertSessionHasNoErrors();

    expect($business->refresh()->logo)->not->toBeNull();
});
