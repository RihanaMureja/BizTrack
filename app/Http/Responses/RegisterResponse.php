<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        if ($user?->isOwner()) {
            return redirect()->route('business.setup');
        }

        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        return redirect()->route('dashboard');
    }
}
