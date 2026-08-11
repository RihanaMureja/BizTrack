<?php

use App\Enums\BusinessAccessMode;
use App\Enums\BusinessCategory;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function themedOwnerContext(array $businessOverrides = []): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Active,
        'business_category' => BusinessCategory::RetailShop,
        ...$businessOverrides,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('business category is saved from business settings', function () {
    [$owner] = themedOwnerContext();

    $this->actingAs($owner)
        ->post(route('settings.business.update'), [
            '_method' => 'put',
            'business_name' => 'Palette Shop',
            'business_category' => BusinessCategory::Restaurant->value,
            'email' => 'palette@example.test',
        ])
        ->assertRedirect();

    expect($owner->ownedBusiness->refresh()->business_category)->toBe(BusinessCategory::Restaurant);
});

test('business category must be a known category', function () {
    [$owner] = themedOwnerContext();

    $this->actingAs($owner)
        ->post(route('settings.business.update'), [
            '_method' => 'put',
            'business_name' => 'Palette Shop',
            'business_category' => 'unknown',
        ])
        ->assertSessionHasErrors('business_category');
});

test('logo upload generates a safe business theme palette', function () {
    Storage::fake('public');
    [$owner] = themedOwnerContext();

    $this->actingAs($owner)
        ->post(route('settings.business.update'), [
            '_method' => 'put',
            'business_name' => 'Logo Theme Shop',
            'business_category' => BusinessCategory::RetailShop->value,
            'logo' => UploadedFile::fake()->image('logo.png', 80, 80),
        ])
        ->assertRedirect();

    $business = $owner->ownedBusiness->refresh();

    expect($business->theme_primary)->toStartWith('#')
        ->and($business->theme_secondary)->toStartWith('#')
        ->and($business->theme_accent)->toStartWith('#')
        ->and($business->theme_palette_source)->toBeIn(['logo', 'default']);
});

test('business without logo receives category palette', function () {
    [$owner] = themedOwnerContext();

    $this->actingAs($owner)
        ->post(route('settings.business.update'), [
            '_method' => 'put',
            'business_name' => 'No Logo Boutique',
            'business_category' => BusinessCategory::Boutique->value,
        ])
        ->assertRedirect();

    $business = $owner->ownedBusiness->refresh();

    expect($business->theme_mode)->toBe('category')
        ->and($business->theme_palette_source)->toBe('category')
        ->and($business->theme_primary)->not->toBeNull();
});

test('owner can manually customize appearance colors', function () {
    [$owner] = themedOwnerContext();

    $this->actingAs($owner)
        ->put(route('appearance.update'), [
            'theme_mode' => 'manual',
            'theme_primary' => '#FFB6C1',
            'theme_secondary' => '#7C3AED',
            'theme_accent' => '#F97316',
        ])
        ->assertRedirect();

    $business = $owner->ownedBusiness->refresh();

    expect($business->theme_mode)->toBe('manual')
        ->and($business->theme_palette_source)->toBe('manual')
        ->and($business->theme_primary)->toStartWith('#')
        ->and($business->theme_primary)->not->toBe('#FFB6C1');
});

test('appearance settings shares live tenant palette preview', function () {
    [$owner, $business] = themedOwnerContext([
        'theme_primary' => '#006B3F',
        'theme_secondary' => '#155E75',
        'theme_accent' => '#A16207',
        'theme_background' => '#F8FAFC',
        'theme_text' => '#0F172A',
        'theme_palette_source' => 'logo',
    ]);

    $this->actingAs($owner)
        ->get(route('appearance.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/appearance')
            ->where('tenantTheme.primary', '#006B3F')
            ->where('tenantTheme.background', fn (string $background): bool => $background !== '#F8FAFC')
            ->where('auth.user.business_category', $business->business_category->value));
});

test('dashboard next steps respond to business category', function () {
    [$owner] = themedOwnerContext([
        'business_category' => BusinessCategory::Restaurant,
    ]);

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.nextSteps.0', 'Set up menu categories'));
});
