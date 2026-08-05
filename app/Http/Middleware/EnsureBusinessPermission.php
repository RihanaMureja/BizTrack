<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBusinessPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        abort_unless($user, 403);

        foreach ($permissions as $permission) {
            if ($user->hasBusinessPermission($permission)) {
                return $next($request);
            }
        }

        abort(403);
    }
}
