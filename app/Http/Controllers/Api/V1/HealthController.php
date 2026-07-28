<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;

class HealthController extends BaseApiController
{
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'app' => config('app.name'),
            'status' => 'ok',
        ], 'BizTrack API is healthy.');
    }
}
