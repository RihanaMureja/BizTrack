<?php

use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Enums\BusinessAccessMode;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Notification;
use App\Models\SystemHealthCheck;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

test('only super admins can view platform operations', function () {
    $this->get(route('admin.system-health.index'))->assertRedirect(route('login'));

    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Active,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->get(route('admin.system-health.index'))
        ->assertForbidden();

    $admin = User::factory()->create(['role' => Role::SuperAdmin]);

    $this->actingAs($admin)
        ->get(route('admin.system-health.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/system-health')
            ->has('health.coreServices')
            ->has('health.gateways')
            ->has('health.charts.uptime'));

    expect(SystemHealthCheck::query()->count())->toBeGreaterThan(0);
});

test('super admin can run manual health operations', function () {
    Mail::fake();

    $admin = User::factory()->create(['role' => Role::SuperAdmin]);

    $this->actingAs($admin)
        ->post(route('admin.system-health.refresh'))
        ->assertRedirect();

    $this->actingAs($admin)
        ->post(route('admin.system-health.mail-test'))
        ->assertRedirect();

    $this->actingAs($admin)
        ->post(route('admin.system-health.gateways.test', 'telebirr'))
        ->assertRedirect();

    DB::table('failed_jobs')->insert([
        'uuid' => (string) str()->uuid(),
        'connection' => 'database',
        'queue' => 'default',
        'payload' => '{}',
        'exception' => 'Test failure',
        'failed_at' => now(),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.system-health.clear-failed-jobs'))
        ->assertRedirect();

    expect(DB::table('failed_jobs')->count())->toBe(0);
});

test('degraded platform health creates a deduped super admin alert', function () {
    $admin = User::factory()->create(['role' => Role::SuperAdmin]);

    $this->actingAs($admin)
        ->get(route('admin.system-health.index'))
        ->assertOk();

    expect(Notification::query()
        ->where('user_id', $admin->id)
        ->where('category', NotificationCategory::System->value)
        ->whereIn('priority', [NotificationPriority::High->value, NotificationPriority::Critical->value])
        ->exists())->toBeTrue();
});
