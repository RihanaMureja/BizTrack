<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForcePasswordResetRequest;
use App\Services\PasswordSecurityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ForcePasswordResetController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->must_reset_password) {
            return to_route('dashboard');
        }

        return Inertia::render('auth/force-password-reset', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'temporaryPasswordExpiresAt' => $request->user()->temporary_password_expires_at?->toISOString(),
        ]);
    }

    public function update(ForcePasswordResetRequest $request, PasswordSecurityService $passwordSecurityService): RedirectResponse
    {
        $passwordSecurityService->setPermanentPassword($request->user(), $request->validated('password'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Password reset successfully.']);

        return to_route('security-questions.edit');
    }
}
