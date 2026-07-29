<?php

namespace App\Http\Middleware;

use App\Enums\RecordStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBusinessIsApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->isSuperAdmin()) {
            return $next($request);
        }

        $business = $user->ownedBusiness ?? $user->business;

        if (! $business || $business->status !== RecordStatus::Active) {
            if (! $user->isOwner()) {
                abort(403);
            }

            return redirect()->route('business.profile')
                ->with('error', 'Your business must be reviewed and approved before you can access this module.');
        }

        return $next($request);
    }
}
