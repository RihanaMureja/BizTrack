<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

abstract class BaseApiController extends Controller
{
    /**
     * @param  array<string, mixed>  $meta
     */
    protected function success(mixed $data = null, string $message = 'OK', array $meta = []): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'data' => $data,
            'meta' => $meta,
        ]);
    }
}
