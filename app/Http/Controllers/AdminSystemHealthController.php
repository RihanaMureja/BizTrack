<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\V1\HealthController as ApiHealthController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSystemHealthController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $payload = app(ApiHealthController::class)()->getData(true);

        return Inertia::render('admin/system-health', [
            'health' => [
                'message' => $payload['message'] ?? 'Health data unavailable.',
                'data' => $payload['data'] ?? [],
                'meta' => $payload['meta'] ?? [],
                'checked_at' => now()->toIso8601String(),
                'endpoint' => url('/api/v1/health'),
            ],
        ]);
    }
}
