<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Requests\BusinessProfileRequest;
use App\Models\Subscription;
use App\Services\BusinessService;
use App\Services\OnboardingService;
use App\Services\PhoneOtpService;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly OnboardingService $onboardingService,
        private readonly PhoneOtpService $phoneOtpService,
        private readonly SubscriptionService $subscriptionService,
    ) {}

    public function index(Request $request): RedirectResponse
    {
        return redirect()->to($this->onboardingService->nextRouteFor($request->user()));
    }

    public function businessProfile(Request $request): Response
    {
        return Inertia::render('onboarding/business-profile', [
            'business' => $request->user()->ownedBusiness,
        ]);
    }

    public function storeBusinessProfile(BusinessProfileRequest $request): RedirectResponse
    {
        $this->businessService->upsertForOwner($request->user(), $request->validated());

        return to_route('onboarding.verify-phone')->with('success', 'Business profile saved.');
    }

    public function verifyPhone(Request $request): Response
    {
        return Inertia::render('onboarding/verify-phone', [
            'phone' => $request->user()->phone,
            'devOtp' => $request->session()->get('dev_otp'),
        ]);
    }

    public function sendPhoneCode(\App\Http\Requests\VerifyOwnerPhoneRequest $request): RedirectResponse
    {
        $code = $this->phoneOtpService->send($request->user(), $request->validated('phone'));
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Verification code generated for local testing.']);

        return back()->with('dev_otp', $code);
    }

    public function verifyPhoneCode(\App\Http\Requests\VerifyOwnerPhoneRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (! $this->phoneOtpService->verify($request->user(), $data['phone'], (string) $data['code'])) {
            return back()->withErrors(['code' => 'The verification code is invalid or expired.']);
        }

        return to_route('onboarding.choose-plan')->with('success', 'Phone verified.');
    }

    public function choosePlan(Request $request): Response
    {
        return Inertia::render('onboarding/choose-plan', [
            'business' => $request->user()->ownedBusiness,
            'subscriptions' => $this->subscriptionService->activePlans(),
        ]);
    }

    public function activatePlan(Request $request, Subscription $subscription): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;
        abort_unless($business, 403);

        $this->onboardingService->activatePaidPlan($business, $subscription);

        return to_route('dashboard')->with('success', 'Your plan is active.');
    }
}
