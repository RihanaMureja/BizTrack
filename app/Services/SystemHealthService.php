<?php

namespace App\Services;

use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Enums\NotificationType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\AuditLog;
use App\Models\Payment;
use App\Models\SystemHealthCheck;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;
use Throwable;

class SystemHealthService
{
    private const SCHEDULER_CACHE_KEY = 'system_health:last_successful_schedule_run';
    private const LAST_GATEWAY_TEST_KEY = 'system_health:last_gateway_test';
    private const LAST_MAIL_TEST_KEY = 'system_health:last_mail_test';

    public function __construct(private readonly PlatformNotificationService $platformNotifications) {}

    public function snapshot(bool $persist = true): array
    {
        $checks = [
            $this->appCheck(),
            $this->databaseCheck(),
            $this->cacheCheck(),
            $this->queueCheck(),
            $this->mailCheck(),
            $this->storageCheck(),
            $this->schedulerCheck(),
        ];

        $gateways = $this->gatewayChecks();
        $incidents = collect([...$checks, ...$gateways])
            ->filter(fn (array $check): bool => $check['status'] !== 'healthy')
            ->map(fn (array $check): array => [
                'title' => $check['label'].' is '.$check['status'],
                'message' => $check['description'],
                'status' => $check['status'],
                'priority' => $check['status'] === 'down' ? NotificationPriority::Critical->value : NotificationPriority::High->value,
                'created_at' => now()->toIso8601String(),
            ])
            ->values()
            ->all();
        $score = max(0, 100 - collect($incidents)->sum(fn (array $incident): int => $incident['status'] === 'down' ? 25 : 10));
        $status = $score < 60 ? 'down' : ($score < 90 ? 'degraded' : 'healthy');

        $snapshot = [
            'status' => $status,
            'score' => $score,
            'checked_at' => now()->toIso8601String(),
            'current' => [
                'message' => $status === 'healthy' ? 'BizTrack platform services are operating normally.' : 'One or more platform services need attention.',
                'app' => config('app.name'),
            ],
            'coreServices' => $checks,
            'gateways' => $gateways,
            'backgroundJobs' => $this->backgroundJobs(),
            'charts' => $this->charts(),
            'incidents' => $this->recentIncidents($incidents),
            'actions' => [
                'health' => route('admin.system-health.refresh', [], false),
                'mail' => route('admin.system-health.mail-test', [], false),
                'clearFailedJobs' => route('admin.system-health.clear-failed-jobs', [], false),
                'auditLogs' => route('admin.audit-logs.index', [], false),
            ],
        ];

        if ($persist) {
            SystemHealthCheck::create([
                'status' => $status,
                'score' => $score,
                'checks' => ['core' => $checks, 'gateways' => $gateways],
                'incidents' => $incidents,
                'checked_at' => now(),
            ]);

            $this->alertOnFailures($checks, $gateways);
        }

        return $snapshot;
    }

    public function recordSuccessfulScheduleRun(): void
    {
        Cache::put(self::SCHEDULER_CACHE_KEY, now()->toIso8601String(), now()->addDays(7));
    }

    public function recordFailedScheduleRun(string $task): void
    {
        $this->platformNotifications->notifySuperAdmins(
            NotificationType::PlatformSystemHealthCritical,
            'Scheduled task failed',
            $task.' failed during scheduled execution.',
            null,
            null,
            NotificationCategory::System,
            NotificationPriority::Critical,
            route('admin.system-health.index', [], false),
            'schedule-failed:'.$task.':'.now()->toDateString(),
        );
    }

    public function testGateway(string $gateway): array
    {
        $known = collect($this->gatewayDefinitions())->firstWhere('key', $gateway);
        $result = [
            'gateway' => $known['label'] ?? str($gateway)->replace('-', ' ')->title()->toString(),
            'status' => $known ? 'healthy' : 'degraded',
            'message' => $known ? 'Demo gateway handoff is ready.' : 'Unknown gateway selected.',
            'tested_at' => now()->toIso8601String(),
        ];

        Cache::put(self::LAST_GATEWAY_TEST_KEY.':'.$gateway, $result, now()->addDay());

        return $result;
    }

    public function recordMailTest(bool $ok, string $message): void
    {
        Cache::put(self::LAST_MAIL_TEST_KEY, [
            'status' => $ok ? 'healthy' : 'down',
            'message' => $message,
            'tested_at' => now()->toIso8601String(),
        ], now()->addDay());
    }

    public function clearFailedJobs(): int
    {
        if (! Schema::hasTable('failed_jobs')) {
            return 0;
        }

        return DB::table('failed_jobs')->delete();
    }

    private function appCheck(): array
    {
        return $this->check('app', 'Application', 'healthy', config('app.name').' is booted.', 'Laravel app runtime is responding.');
    }

    private function databaseCheck(): array
    {
        try {
            DB::select('select 1');

            return $this->check('database', 'Database', 'healthy', 'Database connection is reachable.', config('database.default'));
        } catch (Throwable $exception) {
            return $this->check('database', 'Database', 'down', 'Database connection failed: '.$exception->getMessage(), config('database.default'));
        }
    }

    private function cacheCheck(): array
    {
        try {
            $key = 'system_health:cache:'.now()->timestamp;
            Cache::put($key, 'ok', 60);
            $ok = Cache::get($key) === 'ok';
            Cache::forget($key);

            return $this->check('cache', 'Cache', $ok ? 'healthy' : 'degraded', $ok ? 'Cache read/write is working.' : 'Cache write succeeded but read failed.', config('cache.default'));
        } catch (Throwable $exception) {
            return $this->check('cache', 'Cache', 'down', 'Cache check failed: '.$exception->getMessage(), config('cache.default'));
        }
    }

    private function queueCheck(): array
    {
        $pending = Schema::hasTable('jobs') ? DB::table('jobs')->count() : 0;
        $failed = Schema::hasTable('failed_jobs') ? DB::table('failed_jobs')->count() : 0;
        $status = $failed > 10 ? 'down' : ($failed > 0 || $pending > 50 ? 'degraded' : 'healthy');

        return $this->check('queue', 'Queue', $status, "{$pending} pending job(s), {$failed} failed job(s).", config('queue.default'), [
            'pending' => $pending,
            'failed' => $failed,
        ]);
    }

    private function mailCheck(): array
    {
        $mailer = (string) config('mail.default');
        $lastTest = Cache::get(self::LAST_MAIL_TEST_KEY);
        $configured = $mailer !== 'smtp' || filled(config('mail.mailers.smtp.host'));
        $status = $configured ? (($lastTest['status'] ?? 'healthy') === 'down' ? 'down' : 'healthy') : 'degraded';
        $description = $lastTest['message'] ?? ($configured ? "Mailer {$mailer} is configured." : 'SMTP mailer is missing a host.');

        return $this->check('mail', 'Mail', $status, $description, $mailer, [
            'last_tested_at' => $lastTest['tested_at'] ?? null,
        ]);
    }

    private function storageCheck(): array
    {
        try {
            $path = 'health-checks/'.uniqid('storage-', true).'.txt';
            Storage::disk('public')->put($path, 'ok');
            $ok = Storage::disk('public')->exists($path) && Storage::disk('public')->get($path) === 'ok';
            Storage::disk('public')->delete($path);

            return $this->check('storage', 'Storage', $ok ? 'healthy' : 'degraded', $ok ? 'Public disk write/read/delete is working.' : 'Public disk write/read check failed.', 'public');
        } catch (Throwable $exception) {
            return $this->check('storage', 'Storage', 'down', 'Storage check failed: '.$exception->getMessage(), 'public');
        }
    }

    private function schedulerCheck(): array
    {
        $lastRun = Cache::get(self::SCHEDULER_CACHE_KEY);
        $lastRunAt = $lastRun ? Carbon::parse($lastRun) : null;
        $isFresh = $lastRunAt && $lastRunAt->greaterThan(now()->subDay());
        $status = $isFresh ? 'healthy' : 'degraded';

        return $this->check('scheduler', 'Scheduler', $status, $isFresh ? 'Scheduler has reported a successful run recently.' : 'No successful scheduler run has been recorded in the last 24 hours.', 'daily tasks', [
            'last_successful_run_at' => $lastRunAt?->toIso8601String(),
        ]);
    }

    private function gatewayChecks(): array
    {
        return collect($this->gatewayDefinitions())->map(function (array $gateway): array {
            $lastTest = Cache::get(self::LAST_GATEWAY_TEST_KEY.':'.$gateway['key']);

            return $this->check(
                $gateway['key'],
                $gateway['label'],
                $lastTest['status'] ?? 'healthy',
                $lastTest['message'] ?? 'Demo payment gateway handoff is available.',
                $gateway['mode'],
                ['last_tested_at' => $lastTest['tested_at'] ?? null],
            );
        })->all();
    }

    private function backgroundJobs(): array
    {
        $failed = Schema::hasTable('failed_jobs')
            ? DB::table('failed_jobs')->latest('failed_at')->take(6)->get()
            : collect();

        return [
            'pending_count' => Schema::hasTable('jobs') ? DB::table('jobs')->count() : 0,
            'failed_count' => Schema::hasTable('failed_jobs') ? DB::table('failed_jobs')->count() : 0,
            'latest_failed_at' => $failed->first()?->failed_at,
            'recent_failed' => $failed->map(fn (object $job): array => [
                'id' => $job->id,
                'queue' => $job->queue,
                'failed_at' => (string) $job->failed_at,
                'summary' => str((string) $job->exception)->limit(140)->toString(),
            ])->values()->all(),
        ];
    }

    private function charts(): array
    {
        return [
            'uptime' => $this->uptimeSeries(),
            'failedJobs' => $this->failedJobSeries(),
            'gatewayOutcomes' => $this->gatewayOutcomeSeries(),
            'mailDelivery' => $this->mailDeliverySeries(),
        ];
    }

    private function uptimeSeries(): array
    {
        $history = SystemHealthCheck::query()
            ->where('checked_at', '>=', now()->subHours(23)->startOfHour())
            ->orderBy('checked_at')
            ->get()
            ->groupBy(fn (SystemHealthCheck $check): string => $check->checked_at->format('Y-m-d H'));

        return $this->hourlySeries(fn (CarbonInterface $hour): float => (float) ($history->get($hour->format('Y-m-d H'))?->last()?->score ?? 100));
    }

    private function failedJobSeries(): array
    {
        if (! Schema::hasTable('failed_jobs')) {
            return $this->hourlySeries(fn (): float => 0);
        }

        $failed = DB::table('failed_jobs')
            ->where('failed_at', '>=', now()->subHours(23)->startOfHour())
            ->get()
            ->groupBy(fn (object $job): string => Carbon::parse($job->failed_at)->format('Y-m-d H'));

        return $this->hourlySeries(fn (CarbonInterface $hour): float => (float) ($failed->get($hour->format('Y-m-d H'))?->count() ?? 0));
    }

    private function gatewayOutcomeSeries(): array
    {
        return collect($this->gatewayDefinitions())->map(function (array $gateway): array {
            $method = $gateway['payment_method'];
            $base = $method
                ? Payment::query()->where('method', $method)->where('created_at', '>=', now()->subDays(30))
                : Payment::query()->whereRaw('1 = 0');

            return [
                'label' => $gateway['label'],
                'success' => (float) (clone $base)->where('status', PaymentStatus::Completed->value)->count(),
                'failed' => (float) (clone $base)->where('status', PaymentStatus::Failed->value)->count(),
                'pending' => (float) (clone $base)->where('status', PaymentStatus::Pending->value)->count(),
            ];
        })->values()->all();
    }

    private function mailDeliverySeries(): array
    {
        $lastTest = Cache::get(self::LAST_MAIL_TEST_KEY);

        return [
            ['label' => 'Configured', 'value' => config('mail.default') ? 1 : 0],
            ['label' => 'Last test OK', 'value' => ($lastTest['status'] ?? 'healthy') === 'healthy' ? 1 : 0],
            ['label' => 'Last test failed', 'value' => ($lastTest['status'] ?? 'healthy') === 'down' ? 1 : 0],
        ];
    }

    private function recentIncidents(array $currentIncidents): array
    {
        $history = SystemHealthCheck::query()
            ->where('status', '!=', 'healthy')
            ->latest('checked_at')
            ->take(5)
            ->get()
            ->flatMap(fn (SystemHealthCheck $check) => collect($check->incidents ?? [])->map(fn (array $incident): array => [
                ...$incident,
                'created_at' => $check->checked_at->toIso8601String(),
            ]))
            ->take(5)
            ->values()
            ->all();

        return collect($currentIncidents)->merge($history)->take(8)->values()->all();
    }

    private function alertOnFailures(array $checks, array $gateways): void
    {
        foreach ([...$checks, ...$gateways] as $check) {
            if ($check['status'] === 'healthy') {
                continue;
            }

            $category = in_array($check['key'], ['telebirr', 'mpesa', 'cbebirr', 'apollo'], true)
                ? NotificationCategory::Payment
                : NotificationCategory::System;
            $priority = $check['status'] === 'down' ? NotificationPriority::Critical : NotificationPriority::High;
            $type = $category === NotificationCategory::Payment
                ? NotificationType::PlatformPaymentGatewayFailed
                : NotificationType::PlatformSystemHealthCritical;

            $this->platformNotifications->notifySuperAdmins(
                $type,
                $check['label'].' health '.$check['status'],
                $check['description'],
                null,
                null,
                $category,
                $priority,
                route('admin.system-health.index', [], false),
                'health:'.$check['key'].':'.$check['status'].':'.now()->toDateString(),
            );
        }
    }

    private function hourlySeries(callable $valueResolver): array
    {
        $series = [];
        $cursor = now()->subHours(23)->startOfHour();

        while ($cursor <= now()) {
            $series[] = [
                'label' => $cursor->format('H:00'),
                'value' => $valueResolver($cursor),
            ];
            $cursor = $cursor->addHour();
        }

        return $series;
    }

    private function check(string $key, string $label, string $status, string $description, string $detail, array $meta = []): array
    {
        return [
            'key' => $key,
            'label' => $label,
            'status' => $status,
            'description' => $description,
            'detail' => $detail,
            'meta' => $meta,
        ];
    }

    private function gatewayDefinitions(): array
    {
        return [
            ['key' => 'telebirr', 'label' => 'Telebirr', 'mode' => 'demo handoff', 'payment_method' => PaymentMethod::Telebirr->value],
            ['key' => 'mpesa', 'label' => 'M-Pesa', 'mode' => 'demo handoff', 'payment_method' => null],
            ['key' => 'cbebirr', 'label' => 'CBE Birr', 'mode' => 'demo handoff', 'payment_method' => null],
            ['key' => 'apollo', 'label' => 'Apollo', 'mode' => 'demo handoff', 'payment_method' => null],
        ];
    }
}
