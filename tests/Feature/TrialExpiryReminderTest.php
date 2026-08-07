<?php

use App\Enums\BusinessAccessMode;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\User;
use App\Notifications\TrialExpiringNotification;
use Illuminate\Support\Facades\Notification;

test('trial expiring reminder is sent once before expiry', function () {
    Notification::fake();

    $owner = User::factory()->create([
        'role' => Role::Owner,
    ]);

    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Trial,
        'trial_ends_at' => now()->addDays(2),
        'trial_expiry_notified_at' => null,
    ]);

    $owner->forceFill(['business_id' => $business->id])->save();

    $this->artisan('trials:send-expiry-reminders')
        ->expectsOutput('Sent 1 trial expiry reminder(s).')
        ->assertExitCode(0);

    Notification::assertSentTo($owner, TrialExpiringNotification::class);
    expect($business->refresh()->trial_expiry_notified_at)->not->toBeNull();

    $this->artisan('trials:send-expiry-reminders')
        ->expectsOutput('Sent 0 trial expiry reminder(s).')
        ->assertExitCode(0);
});
