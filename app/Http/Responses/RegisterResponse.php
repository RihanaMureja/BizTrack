<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Fortify;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 201);
        }

        if ($request->user()?->hasVerifiedEmail() === false) {
            return redirect()->route('verification.notice');
        }

        return redirect()->intended(Fortify::redirects('register'));
    }
}
