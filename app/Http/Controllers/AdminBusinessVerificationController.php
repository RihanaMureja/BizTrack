<?php

namespace App\Http\Controllers;

use App\Enums\BusinessVerificationDecision;
use App\Http\Requests\ReviewBusinessVerificationRequest;
use App\Models\Business;
use App\Services\BusinessVerificationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminBusinessVerificationController extends Controller
{
    public function __construct(private readonly BusinessVerificationService $businessVerificationService) {}

    public function show(Business $business): Response
    {
        $this->authorize('updateStatus', Business::class);

        return Inertia::render('admin/business-verifications/show', [
            'business' => $business->load([
                'owner:id,first_name,last_name,email,phone,role,status',
                'subscription:id,name,price',
                'verificationDocuments.reviewer:id,first_name,last_name,email,role,status',
                'verificationReviews.reviewer:id,first_name,last_name,email,role,status',
            ]),
        ]);
    }

    public function review(ReviewBusinessVerificationRequest $request, Business $business): RedirectResponse
    {
        $decision = BusinessVerificationDecision::from($request->validated('decision'));
        $reason = $request->validated('reason');

        match ($decision) {
            BusinessVerificationDecision::Approved => $this->businessVerificationService->approve($business, $request->user(), $reason),
            BusinessVerificationDecision::Rejected => $this->businessVerificationService->reject($business, $request->user(), (string) $reason),
            BusinessVerificationDecision::ResubmissionRequired => $this->businessVerificationService->requestResubmission($business, $request->user(), (string) $reason),
        };

        return to_route('admin.business-verifications.show', $business)
            ->with('success', 'Business verification reviewed.');
    }
}
