<?php

namespace App\Http\Controllers;

use App\Enums\ExpenseSource;
use App\Helpers\DateHelper;
use App\Helpers\ReportHelper;
use App\Http\Requests\GenerateReportRequest;
use App\Models\Category;
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
        [$from, $to] = DateHelper::range(
            $request->string('date_from')->toString() ?: null,
            $request->string('date_to')->toString() ?: null,
        );
        $data = $business
            ? $this->reportService->data($business, $type, $from, $to, [
                'source' => $request->string('source')->toString() ?: null,
                'category_id' => $request->integer('category_id') ?: null,
            ])
            : ['summary' => [], 'chart' => [], 'rows' => []];

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
                'productProfit' => $data['productProfit'] ?? [],
            ],
            'recentReports' => $business ? $this->reportService->latestForBusiness($business) : [],
            'categories' => $business ? Category::query()->where('business_id', $business->id)->orderBy('name')->get(['id', 'name']) : [],
            'types' => [
                ['value' => 'sales', 'label' => 'Sales'],
                ['value' => 'expenses', 'label' => 'Expenses'],
                ['value' => 'profit', 'label' => 'Profit'],
                ['value' => 'inventory', 'label' => 'Inventory'],
                ['value' => 'tax', 'label' => 'Tax'],
            ],
            'sources' => collect(ExpenseSource::cases())->map(fn (ExpenseSource $source): array => [
                'value' => $source->value,
                'label' => $source->label(),
            ])->values(),
            'filters' => [
                'type' => $type,
                'date_from' => $from->toDateString(),
                'date_to' => $to->toDateString(),
                'source' => $request->string('source')->toString() ?: '',
                'category_id' => $request->integer('category_id') ?: '',
            ],
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
            'source' => $request->validated('source'),
            'category_id' => $request->validated('category_id'),
        ])->with('success', $report->title.' generated.');
    }
}
