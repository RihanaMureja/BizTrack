<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Subscription;
use App\Services\AuditLogService;
use App\Services\BusinessService;
use App\Services\BusinessVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BusinessManagementController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly AuditLogService $auditLogService,
        private readonly BusinessVerificationService $businessVerificationService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Business::class);

        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'status' => $request->string('status')->toString() ?: null,
        ];

        return Inertia::render('admin/businesses/index', [
            'businesses' => $this->businessService->paginateForAdmin($filters),
            'subscriptions' => Subscription::query()->orderBy('price')->get(['id', 'name', 'price', 'status']),
            'statuses' => collect(RecordStatus::cases())->map(fn (RecordStatus $status): array => [
                'value' => $status->value,
                'label' => str($status->value)->replace('_', ' ')->title()->toString(),
            ]),
            'filters' => $filters,
        ]);
    }

    public function approve(Request $request, Business $business): RedirectResponse
    {
        $this->authorize('updateStatus', Business::class);
        $this->businessVerificationService->approve($business, $request->user());
        $business->refresh();

        return back()->with('success', $business->business_name.' approved.');
    }

    public function deactivate(Request $request, Business $business): RedirectResponse
    {
        $this->authorize('updateStatus', Business::class);
        $oldValues = $business->only(['status']);
        $this->businessService->deactivate($business);
        $this->auditLogService->log('business.deactivated', $business, $business, $oldValues, $business->only(['status']), $request->user(), $request);

        return back()->with('success', $business->business_name.' deactivated.');
    }

    public function updateSubscription(Request $request, Business $business): RedirectResponse
    {
        $this->authorize('updateStatus', Business::class);
        $data = $request->validate([
            'subscription_id' => ['required', 'integer', Rule::exists('subscriptions', 'id')],
        ]);
        $oldValues = $business->only(['subscription_id']);
        $this->businessService->assignSubscription($business, (int) $data['subscription_id']);
        $this->auditLogService->log('business.subscription_updated', $business, $business, $oldValues, $business->only(['subscription_id']), $request->user(), $request);

        return back()->with('success', 'Subscription updated.');
    }
}
