<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Models\Subscription;
use App\Services\AuditLogService;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService,
        private readonly AuditLogService $auditLogService,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $filters = [
            'search' => $request->string('search')->toString() ?: null,
            'status' => $request->string('status')->toString() ?: null,
        ];

        return Inertia::render('admin/subscriptions/index', [
            'subscriptions' => $this->subscriptionService->paginateForAdmin($filters),
            'statuses' => collect(RecordStatus::cases())->map(fn (RecordStatus $status): array => ['value' => $status->value, 'label' => ucfirst($status->value)]),
            'filters' => $filters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        $data = $this->validated($request);
        $subscription = $this->subscriptionService->create($data);
        $this->auditLogService->log('subscription.created', $subscription, null, null, $subscription->only(['name', 'price', 'duration_months', 'max_cashiers', 'status']), $request->user(), $request);

        return back()->with('success', $subscription->name.' created.');
    }

    public function update(Request $request, Subscription $subscription): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        $oldValues = $subscription->only(['name', 'price', 'duration_months', 'max_cashiers', 'description', 'status']);
        $this->subscriptionService->update($subscription, $this->validated($request, $subscription));
        $this->auditLogService->log('subscription.updated', $subscription, null, $oldValues, $subscription->only(['name', 'price', 'duration_months', 'max_cashiers', 'description', 'status']), $request->user(), $request);

        return back()->with('success', 'Subscription updated.');
    }

    public function activate(Request $request, Subscription $subscription): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        $oldValues = $subscription->only(['status']);
        $this->subscriptionService->activate($subscription);
        $this->auditLogService->log('subscription.activated', $subscription, null, $oldValues, $subscription->only(['status']), $request->user(), $request);

        return back()->with('success', 'Subscription activated.');
    }

    public function deactivate(Request $request, Subscription $subscription): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        $oldValues = $subscription->only(['status']);
        $this->subscriptionService->deactivate($subscription);
        $this->auditLogService->log('subscription.deactivated', $subscription, null, $oldValues, $subscription->only(['status']), $request->user(), $request);

        return back()->with('success', 'Subscription deactivated.');
    }

    private function validated(Request $request, ?Subscription $subscription = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('subscriptions', 'name')->ignore($subscription)],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_months' => ['required', 'integer', 'min:1'],
            'max_cashiers' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:500'],
            'status' => ['required', Rule::enum(RecordStatus::class)],
        ]);
    }
}
