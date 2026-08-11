<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDiscountRuleRequest;
use App\Http\Requests\UpdateCreditLimitOverrideRequest;
use App\Models\Customer;
use App\Models\DiscountRule;
use App\Services\CreditScoringService;
use App\Services\DiscountEngineService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreditDiscountController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly DiscountEngineService $discountEngineService,
        private readonly CreditScoringService $creditScoringService,
    ) {}

    public function index(Request $request): Response
    {
        $business = $request->user()->ownedBusiness;

        return Inertia::render('credit-discounts/index', [
            'discountRules' => $business ? $this->discountEngineService->rulesForBusiness($business) : [],
            'creditProfiles' => $business ? $this->creditScoringService->profilesForBusiness($business) : [],
        ]);
    }

    public function store(StoreDiscountRuleRequest $request): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;

        abort_unless($business, 403);

        $this->discountEngineService->createRule($business, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Discount rule created.']);

        return back();
    }

    public function update(StoreDiscountRuleRequest $request, DiscountRule $discountRule): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;

        abort_unless($business && $discountRule->business_id === $business->id, 403);

        $this->discountEngineService->updateRule($discountRule, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Discount rule updated.']);

        return back();
    }

    public function destroy(Request $request, DiscountRule $discountRule): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;

        abort_unless($business && $discountRule->business_id === $business->id, 403);

        $this->discountEngineService->deleteRule($discountRule);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Discount rule deleted.']);

        return back();
    }

    public function updateCreditLimit(UpdateCreditLimitOverrideRequest $request, Customer $customer): RedirectResponse
    {
        $business = $request->user()->ownedBusiness;

        abort_unless($business && $customer->business_id === $business->id, 403);

        $customer->forceFill([
            'credit_limit' => $request->validated('credit_limit'),
        ])->save();

        $this->creditScoringService->syncProfile($customer);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Credit limit override saved.']);

        return back();
    }
}
