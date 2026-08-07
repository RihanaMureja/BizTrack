<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Requests\StartTrialRequest;
use App\Services\OnboardingService;
use Illuminate\Http\RedirectResponse;

class TrialActivationController extends Controller
{
    public function __construct(private readonly OnboardingService $onboardingService) {}

    public function store(StartTrialRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;
        abort_unless($business && $request->user()->phone, 403);

        $this->onboardingService->startTrial($business);

        return to_route('dashboard')->with('success', 'Your 14-day free trial has started.');
    }
}
