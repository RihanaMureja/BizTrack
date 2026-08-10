<?php

namespace App\Http\Controllers;

use App\Enums\BusinessSubscriptionStatus;
use App\Enums\Role;
use App\Http\Requests\SubscriptionSelectionRequest;
use App\Models\Subscription;
use App\Services\BusinessService;
use App\Services\SubscriptionRecommendationService;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService,
        private readonly SubscriptionRecommendationService $recommendationService,
        private readonly BusinessService $businessService,
    ) {}

    public function index(Request $request): Response
    {
        $business = $request->user()?->ownedBusiness;
        $subscriptionStatus = $business
            ? $this->recommendationService->effectiveStatus($business)->value
            : BusinessSubscriptionStatus::None->value;

        return Inertia::render('business/subscriptions', [
            'subscriptions' => $this->subscriptionService->activePlans(),
            'currentPlanId' => $business?->subscription_id,
            'selectedPlanId' => $request->integer('plan') ?: null,
            'subscriptionStatus' => $subscriptionStatus,
            'cashiersCount' => $business?->users()
                ->where('role', Role::Cashier)
                ->count() ?? 0,
            'recommendation' => $this->recommendationService->recommendationFor($business),
        ]);
    }

    public function select(Request $request): Response|RedirectResponse
    {
        $business = $request->user()?->ownedBusiness;

        if (! $business) {
            return redirect()->route('business.setup');
        }

        if ($business->hasActiveSubscription()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/subscription-select', [
            'business' => [
                'id' => $business->id,
                'business_name' => $business->business_name,
                'business_type' => $business->business_type,
            ],
            'plans' => $this->subscriptionService->activePlans(),
            'selectedPlanId' => $request->integer('plan') ?: null,
            'subscriptionStatus' => $this->recommendationService->effectiveStatus($business)->value,
            'recommendation' => $this->recommendationService->recommendationFor($business),
        ]);
    }

    public function selectPlan(SubscriptionSelectionRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;
        abort_unless($business, 403);

        $plan = Subscription::findOrFail($request->integer('plan_id'));

        if ((float) $plan->price > 0) {
            return redirect()->route('subscriptions.payment', [
                'plan' => $plan->id,
                'back' => $request->validated('back'),
            ]);
        }

        $this->businessService->activateSubscription($business, $plan);

        return redirect()->route('dashboard');
    }
}
