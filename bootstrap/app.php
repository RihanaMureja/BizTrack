<?php

use App\Http\Middleware\BusinessMiddleware;
use App\Http\Middleware\EnsureBusinessIsActive;
use App\Http\Middleware\EnsureBusinessIsApproved;
use App\Http\Middleware\EnsureOnboardingComplete;
use App\Http\Middleware\EnsureBusinessPermission;
use App\Http\Middleware\EnsurePasswordIsNotTemporary;
use App\Http\Middleware\EnsureSubscriptionIsActive;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LogActivity;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'business' => BusinessMiddleware::class,
            'business.active' => EnsureBusinessIsActive::class,
            'business.approved' => EnsureBusinessIsApproved::class,
            'onboarding.complete' => EnsureOnboardingComplete::class,
            'business.permission' => EnsureBusinessPermission::class,
            'subscription.active' => EnsureSubscriptionIsActive::class,
            'role' => RoleMiddleware::class,
            'log.activity' => LogActivity::class,
            'password.not_temporary' => EnsurePasswordIsNotTemporary::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            EnsurePasswordIsNotTemporary::class,
            EnsureOnboardingComplete::class,
            LogActivity::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
