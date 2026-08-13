<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Models\Subscription;
use App\Services\OnboardingService;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService,
        private readonly OnboardingService $onboardingService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('business/subscriptions', [
            'business' => request()->user()->ownedBusiness?->load(['subscription']),
            'subscriptions' => $this->subscriptionService->activePlans(),
        ]);
    }

    public function confirmChange(Request $request, Subscription $subscription): RedirectResponse
    {
        abort_unless($subscription->status === RecordStatus::Active, 404);

        $business = $request->user()->ownedBusiness;
        abort_unless($business, 403);

        $this->onboardingService->activatePaidPlan($business, $subscription);

        return back()->with('success', 'Demo payment confirmed. Your plan is now active.');
    }
}
