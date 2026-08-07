<?php

namespace App\Http\Middleware;

use App\Enums\BusinessAccessMode;
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

        if (! $business
            || $business->status !== RecordStatus::Active
            || ! in_array($business->access_mode, [BusinessAccessMode::Trial, BusinessAccessMode::Active], true)) {
            if (! $user->isOwner()) {
                abort(403);
            }

            return redirect()->route('onboarding.index')
                ->with('error', 'Complete onboarding or choose a plan to access this module.');
        }

        return $next($request);
    }
}
