<?php

namespace App\Traits;

use App\Services\AuditLogService;

trait LogsActivity
{
    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    protected function logActivity(string $action, ?string $tableName = null, ?int $recordId = null, ?array $oldValues = null, ?array $newValues = null): void
    {
        app(AuditLogService::class)->record($action, $tableName, $recordId, $oldValues, $newValues, auth()->user());
    }
}
