<?php

namespace App\Http\Controllers;

use App\Enums\BusinessAccessMode;
use App\Models\Business;
use App\Services\BusinessService;
use Illuminate\Http\Request;
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
            'statuses' => collect(BusinessAccessMode::cases())->map(fn (BusinessAccessMode $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ]),
            'filters' => $filters,
        ]);
    }
}
