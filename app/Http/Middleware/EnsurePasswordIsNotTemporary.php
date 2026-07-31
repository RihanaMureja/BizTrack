<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordIsNotTemporary
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->must_reset_password) {
            return $next($request);
        }

        if ($request->routeIs([
            'password.force.edit',
            'password.force.update',
            'security-questions.*',
            'logout',
        ])) {
            return $next($request);
        }

        if ($request->isMethod('GET')) {
            return redirect()->route('password.force.edit');
        }

        abort(403, 'You must reset your temporary password before continuing.');
    }
}
