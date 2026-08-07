<?php

namespace App\Http\Middleware;

use App\Enums\BusinessAccessMode;
use App\Enums\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== Role::Owner) {
            return $next($request);
        }

        if ($request->routeIs('onboarding.*', 'settings.business.*', 'logout', 'verification.*', 'password.*')) {
            return $next($request);
        }

        $business = $user->ownedBusiness;

        if (! $business || ! in_array($business->access_mode, [BusinessAccessMode::Trial, BusinessAccessMode::Active], true)) {
            return redirect()->route('onboarding.index');
        }

        return $next($request);
    }
}
