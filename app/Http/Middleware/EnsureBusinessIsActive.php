<?php

namespace App\Http\Middleware;

use App\Enums\RecordStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBusinessIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $business = $request->user()?->ownedBusiness ?? $request->user()?->business;

        abort_unless(! $business || $business->status === RecordStatus::Active, 403);

        return $next($request);
    }
}
