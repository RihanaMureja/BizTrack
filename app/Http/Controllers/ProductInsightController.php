<?php

namespace App\Http\Controllers;

use App\Enums\ProductInsightStatus;
use App\Enums\ProductInsightType;
use App\Models\ProductMovementInsight;
use App\Services\ProductInsightService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductInsightController extends Controller
{
    public function __construct(private readonly ProductInsightService $productInsightService) {}

    public function index(Request $request): Response
    {
        $business = $request->user()->ownedBusiness;
        abort_unless($business, 403);

        $tab = $request->string('tab')->toString() ?: 'stagnant';
        $filters = $request->only(['search', 'status']);

        $stagnantInsights = $this->productInsightService->paginateForType($business, ProductInsightType::Stagnant, $filters);
        $expiringInsights = $this->productInsightService->paginateForType($business, ProductInsightType::Expiring, $filters);

        return Inertia::render('products/insights', [
            'stagnantInsights' => $stagnantInsights,
            'expiringInsights' => $expiringInsights,
            'statuses' => collect(ProductInsightStatus::cases())->map(fn(ProductInsightStatus $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
            'preferences' => $this->productInsightService->preferencesFor($business),
            'filters' => [
                'search' => $filters['search'] ?? null,
                'status' => $filters['status'] ?? null,
                'tab' => in_array($tab, ['stagnant', 'expiring'], true) ? $tab : 'stagnant',
            ],
        ]);
    }

    public function dismiss(Request $request, ProductMovementInsight $productMovementInsight): RedirectResponse
    {
        $this->authorizeForOwner($request, $productMovementInsight);

        $this->productInsightService->updateStatus($productMovementInsight, ProductInsightStatus::Dismissed);

        return back()->with('success', 'Product insight dismissed.');
    }

    public function resolve(Request $request, ProductMovementInsight $productMovementInsight): RedirectResponse
    {
        $this->authorizeForOwner($request, $productMovementInsight);

        $this->productInsightService->updateStatus($productMovementInsight, ProductInsightStatus::Resolved);

        return back()->with('success', 'Product insight resolved.');
    }

    private function authorizeForOwner(Request $request, ProductMovementInsight $insight): void
    {
        abort_unless($request->user()?->isOwner() && $insight->business_id === $request->user()->ownedBusiness?->id, 403);
    }
}
