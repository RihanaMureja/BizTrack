<?php

namespace App\Http\Middleware;

use App\Services\AuditLogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogActivity
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $response = $next($request);

        if ($user && ! $request->isMethod('GET') && ! $request->isMethod('HEAD')) {
            $this->auditLogService->record(
                action: $request->method().' '.$request->path(),
                tableName: null,
                recordId: null,
                oldValues: null,
                newValues: ['status' => $response->getStatusCode()],
                user: $user,
            );
        }

        return $response;
    }
}
