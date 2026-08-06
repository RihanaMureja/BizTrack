<?php

namespace App\Http\Controllers;

use App\Helpers\DateHelper;
use App\Helpers\ReportHelper;
use App\Http\Requests\GenerateReportRequest;
use App\Models\Product;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Report::class);

        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        $type = $request->string('type')->toString() ?: 'profit';
        $productId = $request->integer('product_id') ?: null;
        [$from, $to] = DateHelper::range(
            $request->string('date_from')->toString() ?: null,
            $request->string('date_to')->toString() ?: null,
        );
        $data = $business
            ? $this->reportService->data($business, $type, $from, $to, ['product_id' => $productId])
            : ['summary' => [], 'chart' => [], 'rows' => []];
        $products = $business
            ? Product::query()->where('business_id', $business->id)->select('id', 'name')->orderBy('name')->get()
            : collect();

        return Inertia::render('reports/index', [
            'report' => [
                'type' => $type,
                'title' => ReportHelper::title($type),
                'date_from' => $from->toDateString(),
                'date_to' => $to->toDateString(),
                'summary' => $this->reportService->formatSummary($data['summary']),
                'rawSummary' => $data['summary'],
                'chart' => $data['chart'],
                'rows' => $data['rows'],
                'topProducts' => $data['topProducts'] ?? [],
                'product' => $data['product'] ?? null,
            ],
            'recentReports' => $business ? $this->reportService->latestForBusiness($business) : [],
            'types' => [
                ['value' => 'sales', 'label' => 'Sales'],
                ['value' => 'expenses', 'label' => 'Expenses'],
                ['value' => 'profit', 'label' => 'Profit'],
                ['value' => 'inventory', 'label' => 'Inventory'],
                ['value' => 'tax', 'label' => 'Tax'],
                ['value' => 'products', 'label' => 'Products'],
            ],
            'filters' => [
                'type' => $type,
                'date_from' => $from->toDateString(),
                'date_to' => $to->toDateString(),
                'product_id' => $productId,
            ],
            'products' => $products->map(fn(Product $product) => ['id' => $product->id, 'name' => $product->name])->values(),
        ]);
    }

    public function store(GenerateReportRequest $request): RedirectResponse
    {
        $this->authorize('create', Report::class);
        $business = $request->user()->ownedBusiness ?? $request->user()->business;
        abort_unless($business, 403);

        $report = $this->reportService->generate($business, $request->user(), $request->validated());

        return to_route('reports.index', [
            'type' => $report->type,
            'date_from' => $report->date_from?->toDateString(),
            'date_to' => $report->date_to?->toDateString(),
            'product_id' => $request->validated('product_id'),
        ])->with('success', $report->title . ' generated.');
    }
}
