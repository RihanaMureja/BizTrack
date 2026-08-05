<?php

use App\Models\User;

test('preferences page is displayed', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('preferences.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/preferences')
            ->where('preferences.default_landing_page', 'dashboard')
            ->where('preferences.currency', 'ETB')
            ->has('options.landingPages'));
});

test('user preferences can be updated', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('preferences.update'), [
            'default_landing_page' => 'reports',
            'records_per_page' => 25,
            'date_format' => 'd/m/Y',
            'currency' => 'USD',
            'notify_low_stock' => false,
            'notify_payments' => true,
            'notify_credit_reminders' => false,
            'compact_sidebar' => true,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($user->refresh()->preferences)->toMatchArray([
        'default_landing_page' => 'reports',
        'records_per_page' => 25,
        'date_format' => 'd/m/Y',
        'currency' => 'USD',
        'notify_low_stock' => false,
        'notify_payments' => true,
        'notify_credit_reminders' => false,
        'compact_sidebar' => true,
    ]);
});

test('preference values are validated', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('preferences.update'), [
            'default_landing_page' => 'unknown',
            'records_per_page' => 5,
            'date_format' => 'invalid',
            'currency' => 'GBP',
        ])
        ->assertSessionHasErrors(['default_landing_page', 'records_per_page', 'date_format', 'currency']);
});
