<?php

namespace App\Http\Controllers;

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

    public function show(Request $request): Response
    {
        return Inertia::render('business/profile', [
            'business' => $request->user()->ownedBusiness?->load([
                'subscription',
                'verificationDocuments',
                'verificationReviews.reviewer:id,first_name,last_name,email,role,status',
            ]),
            'subscriptions' => $this->subscriptionService->activePlans(),
        ]);
    }

    public function store(StoreBusinessRequest $request): RedirectResponse
    {
        $business = $this->businessService->upsertForOwner($request->user(), $request->validated());

        return to_route('business.profile')->with('success', $business->business_name.' profile created.');
    }

    public function update(UpdateBusinessRequest $request): RedirectResponse
    {
        $business = $this->businessService->upsertForOwner($request->user(), $request->validated());

        return to_route('business.profile')->with('success', $business->business_name.' profile updated.');
    }
}
