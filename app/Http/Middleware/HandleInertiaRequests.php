<?php

namespace App\Http\Middleware;

use App\Services\RBACService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user()?->loadMissing('business', 'ownedBusiness');
        $business = $user?->ownedBusiness ?? $user?->business;
        $businessLogo = $business?->logo ? route('businesses.logo', $business) : null;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'avatar' => $businessLogo,
                    'business_logo' => $businessLogo,
                    'display_business_name' => $business?->business_name,
                ] : null,
            ],
            'navigation' => $user
                ? app(RBACService::class)->navigationFor($user)
                : [],
            'notificationSummary' => [
                'unreadCount' => app(NotificationService::class)->unreadCountForUser($user),
                'recent' => app(NotificationService::class)->recentForUser($user),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
