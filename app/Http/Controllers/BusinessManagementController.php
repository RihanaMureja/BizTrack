<?php

namespace App\Http\Controllers;

use App\Enums\BusinessAccessMode;
use App\Models\Business;
use App\Models\Subscription;
use App\Services\BusinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BusinessManagementController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
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
            'statuses' => collect(BusinessAccessMode::cases())->map(fn (BusinessAccessMode $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ]),
            'filters' => $filters,
        ]);
    }

    public function updateSubscription(Request $request, Business $business): RedirectResponse
    {
        $this->authorize('updateStatus', Business::class);
        $data = $request->validate([
            'subscription_id' => ['required', 'integer', Rule::exists('subscriptions', 'id')],
        ]);
        $this->businessService->assignSubscription($business, (int) $data['subscription_id']);

        return back()->with('success', 'Subscription updated.');
    }
}
