<?php

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::emailVerification());
});

test('sends verification notification', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('home'));

    Notification::assertSentTo($user, VerifyEmailNotification::class);
});

test('verification email is branded for biztrack', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create(['name' => 'Abebe Besso']);

    $this->actingAs($user)
        ->post(route('verification.send'));

    Notification::assertSentTo($user, VerifyEmailNotification::class, function (VerifyEmailNotification $notification) use ($user) {
        $mail = $notification->toMail($user);
        $html = $mail->render();

        expect($mail->subject)->toBe('Verify your BizTrack email')
            ->and($html)->toContain('Hi Abebe Besso')
            ->and($html)->toContain('Verify email')
            ->and($html)->toContain('phone verification')
            ->and($html)->toContain(config('app.email_logo_url'));

        return true;
    });
});

test('does not send verification notification if email is verified', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('dashboard', absolute: false));

    Notification::assertNothingSent();
});
