<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Request as RequestFacade;
use Illuminate\Support\Facades\Schema;
use Throwable;

class AuditLogService
{
    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    public function record(string $action, ?string $tableName = null, ?int $recordId = null, ?array $oldValues = null, ?array $newValues = null, ?User $user = null): ?AuditLog
    {
        return $this->log(
            action: $action,
            tableName: $tableName,
            recordId: $recordId,
            oldValues: $oldValues,
            newValues: $newValues,
            user: $user,
        );
    }

    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    public function log(
        string $action,
        ?Model $auditable = null,
        ?Business $business = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?User $user = null,
        ?HttpRequest $request = null,
        ?string $tableName = null,
        ?int $recordId = null,
    ): ?AuditLog
    {
        if (! Schema::hasTable('audit_logs')) {
            return null;
        }

        try {
            $user ??= auth()->user();
            $tableName ??= $auditable?->getTable();
            $recordId ??= $auditable?->getKey();
            $businessId = $this->resolveBusinessId($business, $auditable, $user);
            $request ??= request();

            $payload = [
                'user_id' => $user?->id ?? auth()->id(),
                'action' => $action,
                'table_name' => $tableName,
                'record_id' => $recordId,
                'old_values' => $this->sanitizeValues($oldValues),
                'new_values' => $this->sanitizeValues($newValues),
                'ip_address' => $request?->ip() ?? RequestFacade::ip(),
            ];

            if (Schema::hasColumn('audit_logs', 'business_id')) {
                $payload['business_id'] = $businessId;
            }

            if (Schema::hasColumn('audit_logs', 'user_agent')) {
                $payload['user_agent'] = $request?->userAgent();
            }

            return AuditLog::create($payload);
        } catch (Throwable $exception) {
            if (app()->isProduction()) {
                report($exception);
            }

            return null;
        }
    }

    private function resolveBusinessId(?Business $business, ?Model $auditable, ?User $user): ?int
    {
        if ($business) {
            return $business->id;
        }

        if ($auditable && isset($auditable->business_id)) {
            return (int) $auditable->business_id;
        }

        return $user?->business_id ?? $user?->ownedBusiness?->id;
    }

    /**
     * @param  array<string, mixed>|null  $values
     * @return array<string, mixed>|null
     */
    private function sanitizeValues(?array $values): ?array
    {
        if ($values === null) {
            return null;
        }

        return collect($values)
            ->except(['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes', 'updated_at', 'created_at'])
            ->map(fn (mixed $value): mixed => $value instanceof \BackedEnum ? $value->value : $value)
            ->all();
    }
}
