<?php

namespace App\Http\Controllers;

use App\Http\Requests\BusinessSetupRequest;
use App\Services\BusinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessSetupController extends Controller
{
    public function __construct(private readonly BusinessService $businessService) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $business = $request->user()?->ownedBusiness;

        if ($business) {
            if ($business->hasActiveSubscription()) {
                return redirect()->route('dashboard');
            }

            if ($business->business_type) {
                return redirect()->route('subscriptions.select');
            }
        }

        return Inertia::render('auth/business-setup');
    }

    public function store(BusinessSetupRequest $request): RedirectResponse
    {
        $this->businessService->setupForOwner($request->user(), $request->validated());

        return redirect()->route('subscriptions.select');
    }
}
