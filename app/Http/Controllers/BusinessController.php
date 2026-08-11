<?php

namespace App\Http\Controllers;

use App\Enums\BusinessCategory;
use App\Http\Requests\StoreBusinessRequest;
use App\Http\Requests\UpdateBusinessRequest;
use App\Services\BusinessService;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly SubscriptionService $subscriptionService,
    ) {}

    public function settings(Request $request): Response
    {
        return Inertia::render('settings/business', [
            'business' => $request->user()->ownedBusiness?->load([
                'subscription',
                'verificationDocuments',
            ]),
            'subscriptions' => $this->subscriptionService->activePlans(),
            'businessCategories' => $this->businessCategories(),
        ]);
    }

    public function store(StoreBusinessRequest $request): RedirectResponse
    {
        $business = $this->businessService->upsertForOwner($request->user(), $request->validated());

        return to_route($business->hasCompletedOnboarding() ? 'settings.business.edit' : 'onboarding.verify-phone')
            ->with('success', $business->business_name.' profile created.');
    }

    public function update(UpdateBusinessRequest $request): RedirectResponse
    {
        $business = $this->businessService->upsertForOwner($request->user(), $request->validated());

        return to_route($business->hasCompletedOnboarding() ? 'settings.business.edit' : 'onboarding.verify-phone')
            ->with('success', $business->business_name.' profile updated.');
    }

    private function businessCategories(): array
    {
        return collect(BusinessCategory::cases())->map(fn (BusinessCategory $category): array => [
            'value' => $category->value,
            'label' => $category->label(),
        ])->values()->all();
    }
}
