<?php

namespace App\Http\Controllers;

use App\Helpers\DateHelper;
use App\Models\Product;
use App\Models\Report;
use App\Services\ProductReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductReportController extends Controller
{
    public function __construct(private readonly ProductReportService $productReportService) {}

    public function show(Request $request, Product $product): Response
    {
        $this->authorize('viewAny', Report::class);

        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        abort_unless($business && $product->business_id === $business->id, 403);

        [$from, $to] = DateHelper::range(
            $request->string('date_from')->toString() ?: null,
            $request->string('date_to')->toString() ?: null,
        );

        return Inertia::render('reports/products', [
            'report' => $this->productReportService->productDetail($business, $product, $from, $to),
            'filters' => [
                'date_from' => $from->toDateString(),
                'date_to' => $to->toDateString(),
            ],
        ]);
    }
}
