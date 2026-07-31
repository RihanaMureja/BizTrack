<?php

namespace App\Http\Controllers;

use App\Enums\ServiceFeeStatus;
use App\Http\Requests\PayServiceFeeRequest;
use App\Models\ServiceFee;
use App\Services\ServiceFeeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceFeeController extends Controller
{
    public function __construct(private readonly ServiceFeeService $serviceFeeService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ServiceFee::class);

        $business = $request->user()->ownedBusiness;
        abort_unless($business, 403);

        $filters = $request->only(['search', 'status', 'from', 'to']);
        $setting = $this->serviceFeeService->settingFor($business);

        return Inertia::render('service-fees/index', [
            'serviceFees' => $this->serviceFeeService->paginateForBusiness($business, $filters),
            'summary' => $this->serviceFeeService->summaryForBusiness($business),
            'setting' => $setting,
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

    public function pay(PayServiceFeeRequest $request, ServiceFee $serviceFee): RedirectResponse
    {
        $this->authorize('pay', $serviceFee);

        $this->serviceFeeService->markPaid($serviceFee, $request->user());

        return back()->with('success', 'Service fee marked as paid.');
    }
}
