<?php

namespace App\Http\Controllers;

use App\Enums\ServiceFeeStatus;
use App\Http\Requests\UpdateServiceFeeSettingRequest;
use App\Models\Business;
use App\Models\ServiceFee;
use App\Services\ServiceFeeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminServiceFeeController extends Controller
{
    public function __construct(private readonly ServiceFeeService $serviceFeeService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ServiceFee::class);

        $filters = $request->only(['search', 'status', 'from', 'to']);

        return Inertia::render('admin/service-fees/index', [
            'serviceFees' => $this->serviceFeeService->paginateForAdmin($filters),
            'summary' => $this->serviceFeeService->platformSummary(),
            'businesses' => Business::query()
                ->with('serviceFeeSetting')
                ->orderBy('business_name')
                ->get(['id', 'business_name', 'email']),
            'statuses' => collect(ServiceFeeStatus::cases())->map(fn (ServiceFeeStatus $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
            'filters' => [
                'search' => $filters['search'] ?? null,
                'status' => $filters['status'] ?? null,
                'from' => $filters['from'] ?? null,
                'to' => $filters['to'] ?? null,
            ],
        ]);
    }

    public function updateSetting(UpdateServiceFeeSettingRequest $request, Business $business): RedirectResponse
    {
        $this->authorize('updateSetting', ServiceFee::class);

        $this->serviceFeeService->updateSetting($business, $request->validated(), $request->user());

        return back()->with('success', 'Service fee setting updated.');
    }
}
