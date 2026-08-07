<?php

use App\Enums\Role;
use App\Models\SecurityQuestion;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('registration requires a strong password', function () {
    $this->post(route('register.store'), [
        'first_name' => 'Weak',
        'last_name' => 'Owner',
        'email' => 'weak-owner@example.test',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors('password');
});

test('temporary password users are redirected to force password reset', function () {
    $cashier = User::factory()->create([
        'role' => Role::Cashier,
        'must_reset_password' => true,
        'temporary_password_expires_at' => now()->addDay(),
    ]);

    $this->actingAs($cashier)
        ->get(route('dashboard'))
        ->assertRedirect(route('password.force.edit', absolute: false));
});

test('temporary password user can set permanent password', function () {
    $cashier = User::factory()->create([
        'role' => Role::Cashier,
        'password' => Hash::make('OldTemp#12345'),
        'must_reset_password' => true,
        'temporary_password_expires_at' => now()->addDay(),
    ]);

    $this->actingAs($cashier)
        ->put(route('password.force.update'), [
            'password' => 'NewStrong#12345',
            'password_confirmation' => 'NewStrong#12345',
        ])
        ->assertRedirect(route('security-questions.edit', absolute: false));

    $cashier->refresh();

    expect($cashier->must_reset_password)->toBeFalse()
        ->and($cashier->password_changed_at)->not->toBeNull()
        ->and($cashier->temporary_password_expires_at)->toBeNull()
        ->and(Hash::check('NewStrong#12345', $cashier->password))->toBeTrue();
});

test('user can save a security question answer', function () {
    $user = User::factory()->create(['role' => Role::Cashier]);
    $question = SecurityQuestion::create([
        'question' => 'What is your test recovery answer?',
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->post(route('security-questions.store'), [
            'security_question_id' => $question->id,
            'answer' => 'Blue Nile',
        ])
        ->assertRedirect(route('dashboard', absolute: false));

    $answer = $user->securityQuestions()->firstOrFail();

    expect(Hash::check('blue nile', $answer->answer_hash))->toBeTrue();
});
