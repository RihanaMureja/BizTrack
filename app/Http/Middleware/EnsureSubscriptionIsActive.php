<?php

namespace App\Http\Middleware;

use App\Enums\RecordStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $business = $request->user()?->ownedBusiness ?? $request->user()?->business;

        abort_unless(! $business?->subscription || $business->subscription->status === RecordStatus::Active, 403);

        return $next($request);
    }
}
