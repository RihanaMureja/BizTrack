<?php

namespace App\Services;

use App\Helpers\CurrencyHelper;
use App\Helpers\DateHelper;
use App\Helpers\ReportHelper;
use App\Models\Business;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Report;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function generate(Business $business, User $user, array $filters): Report
    {
        $type = $filters['type'];
        [$from, $to] = DateHelper::range($filters['date_from'] ?? null, $filters['date_to'] ?? null);
        $data = $this->data($business, $type, $from, $to, $filters);

        return Report::create([
            'business_id' => $business->id,
            'user_id' => $user->id,
            'type' => $type,
            'title' => ReportHelper::title($type),
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),
            'filters' => $filters,
            'summary' => $data['summary'],
            'generated_at' => now(),
        ])->refresh();
    }

    public function latestForBusiness(Business $business): Collection
    {
        return Report::query()
            ->where('business_id', $business->id)
            ->latest('generated_at')
            ->take(8)
            ->get();
    }

    public function data(Business $business, string $type, CarbonInterface $from, CarbonInterface $to, array $filters = []): array
    {
        return match ($type) {
            'sales' => $this->sales($business, $from, $to),
            'expenses' => $this->expenses($business, $from, $to),
            'profit' => $this->profit($business, $from, $to),
            'inventory' => $this->inventory($business),
            'tax' => $this->tax($business, $from, $to),
            'products' => $this->products($business, $from, $to, $filters),
            default => $this->sales($business, $from, $to),
        };
    }

    public function defaultData(Business $business): array
    {
        [$from, $to] = DateHelper::range(null, null);

        return $this->data($business, 'profit', $from, $to) + [
            'type' => 'profit',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),
        ];
    }

    private function sales(Business $business, CarbonInterface $from, CarbonInterface $to): array
    {
        $sales = Sale::query()
            ->where('business_id', $business->id)
            ->whereBetween('sold_at', [$from->startOfDay(), $to->endOfDay()])
            ->with(['customer', 'user'])
            ->latest('sold_at')
            ->get();
        $topProducts = SaleItem::query()
            ->select('product_id', DB::raw('SUM(quantity) as quantity'), DB::raw('SUM(line_total) as total'))
            ->whereHas('sale', fn($query) => $query->where('business_id', $business->id)->whereBetween('sold_at', [$from->startOfDay(), $to->endOfDay()]))
            ->with('product:id,name')
            ->groupBy('product_id')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(fn(SaleItem $item): array => [
                'name' => $item->product?->name ?? 'Deleted product',
                'quantity' => (int) $item->quantity,
                'total' => (float) $item->total,
            ])
            ->values();

        return [
            'summary' => [
                'sales_count' => $sales->count(),
                'revenue' => (float) $sales->sum('grand_total'),
                'tax' => (float) $sales->sum('tax_amount'),
                'discount' => (float) $sales->sum('discount_amount'),
            ],
            'chart' => $this->dailySeries($from, $to, $sales, 'sold_at', 'grand_total'),
            'rows' => $sales->map(fn(Sale $sale): array => [
                'invoice' => $sale->invoice_number,
                'customer' => $sale->customer?->full_name ?? 'Walk-in customer',
                'sold_by' => $sale->user?->name ?? 'System',
                'date' => $sale->sold_at?->toDateString(),
                'total' => (float) $sale->grand_total,
            ])->values(),
            'topProducts' => $topProducts,
        ];
    }

    private function expenses(Business $business, CarbonInterface $from, CarbonInterface $to): array
    {
        $expenses = Expense::query()
            ->where('business_id', $business->id)
            ->whereDate('expense_date', '>=', $from->toDateString())
            ->whereDate('expense_date', '<=', $to->toDateString())
            ->with('category')
            ->latest('expense_date')
            ->get();

        return [
            'summary' => [
                'expenses_count' => $expenses->count(),
                'expenses' => (float) $expenses->sum('amount'),
                'average_expense' => $expenses->count() ? (float) $expenses->avg('amount') : 0,
            ],
            'chart' => $this->dailySeries($from, $to, $expenses, 'expense_date', 'amount'),
            'rows' => $expenses->map(fn(Expense $expense): array => [
                'title' => $expense->title,
                'category' => $expense->category?->name ?? 'Uncategorized',
                'date' => $expense->expense_date?->toDateString(),
                'amount' => (float) $expense->amount,
                'status' => $expense->status->value,
            ])->values(),
        ];
    }

    private function profit(Business $business, CarbonInterface $from, CarbonInterface $to): array
    {
        $sales = $this->sales($business, $from, $to);
        $expenses = $this->expenses($business, $from, $to);
        $revenue = (float) $sales['summary']['revenue'];
        $expenseTotal = (float) $expenses['summary']['expenses'];

        return [
            'summary' => [
                'revenue' => $revenue,
                'expenses' => $expenseTotal,
                'profit' => $revenue - $expenseTotal,
                'margin' => $revenue > 0 ? round((($revenue - $expenseTotal) / $revenue) * 100, 2) : 0,
            ],
            'chart' => $this->mergeProfitSeries($sales['chart'], $expenses['chart']),
            'rows' => [
                ['label' => 'Revenue', 'amount' => $revenue],
                ['label' => 'Expenses', 'amount' => $expenseTotal],
                ['label' => 'Profit', 'amount' => $revenue - $expenseTotal],
            ],
        ];
    }

    private function inventory(Business $business): array
    {
        $products = Product::query()
            ->with(['category', 'inventory'])
            ->where('business_id', $business->id)
            ->orderBy('name')
            ->get();
        $stockValue = $products->sum(fn(Product $product): float => (float) $product->buy_price * (int) ($product->inventory?->available_stock ?? 0));
        $lowStock = $products->filter(fn(Product $product): bool => (int) ($product->inventory?->available_stock ?? 0) <= (int) $product->reorder_level);

        return [
            'summary' => [
                'products' => $products->count(),
                'low_stock' => $lowStock->count(),
                'stock_value' => (float) $stockValue,
            ],
            'chart' => $products->take(8)->map(fn(Product $product): array => [
                'label' => str($product->name)->limit(14)->toString(),
                'value' => (int) ($product->inventory?->available_stock ?? 0),
            ])->values(),
            'rows' => $products->map(fn(Product $product): array => [
                'product' => $product->name,
                'category' => $product->category?->name ?? 'Uncategorized',
                'stock' => (int) ($product->inventory?->available_stock ?? 0),
                'reorder_level' => (int) $product->reorder_level,
                'stock_value' => (float) $product->buy_price * (int) ($product->inventory?->available_stock ?? 0),
            ])->values(),
        ];
    }

    private function products(Business $business, CarbonInterface $from, CarbonInterface $to, array $filters = []): array
    {
        $productId = $filters['product_id'] ?? null;

        if ($productId) {
            $product = Product::query()->with(['category', 'inventory'])->where('business_id', $business->id)->find($productId);

            if (! $product) {
                return [
                    'summary' => ['quantity_sold' => 0, 'revenue' => 0, 'profit' => 0, 'sales_count' => 0, 'current_stock' => 0],
                    'chart' => [],
                    'rows' => [],
                ];
            }

            $saleItems = SaleItem::query()
                ->whereHas('sale', fn($query) => $query->where('business_id', $business->id)->whereBetween('sold_at', [$from->startOfDay(), $to->endOfDay()]))
                ->where('product_id', $product->id)
                ->with('sale')
                ->orderByDesc('sale_id')
                ->get();

            $rows = $saleItems->map(fn(SaleItem $item): array => [
                'date' => $item->sale?->sold_at?->toDateString(),
                'quantity' => (int) $item->quantity,
                'line_total' => (float) $item->line_total,
                'profit' => (float) $item->line_total - ((float) $product->buy_price * (int) $item->quantity),
            ])->values();

            return [
                'summary' => [
                    'quantity_sold' => $saleItems->sum('quantity'),
                    'revenue' => (float) $saleItems->sum('line_total'),
                    'profit' => (float) $saleItems->sum(fn(SaleItem $item): float => ((float) $item->line_total) - ((float) $product->buy_price * (int) $item->quantity)),
                    'sales_count' => $saleItems->count(),
                    'current_stock' => (int) ($product->inventory?->available_stock ?? 0),
                ],
                'chart' => $this->dailySeries($from, $to, $saleItems, 'sale.sold_at', 'line_total'),
                'rows' => $rows,
                'product' => ['name' => $product->name, 'category' => $product->category?->name ?? 'Uncategorized', 'current_stock' => (int) ($product->inventory?->available_stock ?? 0)],
            ];
        }

        $saleItems = SaleItem::query()
            ->select('product_id', DB::raw('SUM(quantity) as quantity_sold'), DB::raw('SUM(line_total) as revenue'), DB::raw('COUNT(DISTINCT sale_id) as sales_count'))
            ->whereHas('sale', fn($query) => $query->where('business_id', $business->id)->whereBetween('sold_at', [$from->startOfDay(), $to->endOfDay()]))
            ->groupBy('product_id')
            ->get();

        $productIds = $saleItems->pluck('product_id');
        $products = Product::query()->with(['category'])->whereIn('id', $productIds)->get()->keyBy('id');

        $rows = $saleItems->map(function ($item) use ($products): array {
            $product = $products->get($item->product_id);
            $quantitySold = (int) $item->quantity_sold;
            $revenue = (float) $item->revenue;
            $buyCost = $product ? (float) $product->buy_price * $quantitySold : 0;

            return [
                'category' => $product?->category?->name ?? 'Uncategorized',
                'products_sold' => 1,
                'quantity' => $quantitySold,
                'revenue' => $revenue,
                'profit' => $revenue - $buyCost,
                'product_name' => $product?->name ?? 'Deleted product',
            ];
        })->values();

        $grouped = $rows->groupBy(fn($row) => $row['category']);

        return [
            'summary' => [
                'categories' => $grouped->count(),
                'products_sold' => $rows->count(),
                'quantity' => $rows->sum('quantity'),
                'revenue' => $rows->sum('revenue'),
                'profit' => $rows->sum('profit'),
            ],
            'chart' => $grouped->map(fn($items, $category) => ['label' => $category, 'value' => (float) collect($items)->sum('revenue')])->values(),
            'rows' => $grouped->map(fn($items, $category) => [
                'category' => $category,
                'product_name' => collect($items)->pluck('product_name')->filter()->unique()->values()->join(', '),
                'products_sold' => collect($items)->sum('products_sold'),
                'quantity' => collect($items)->sum('quantity'),
                'revenue' => collect($items)->sum('revenue'),
                'profit' => collect($items)->sum('profit'),
            ])->values(),
        ];
    }

    private function tax(Business $business, CarbonInterface $from, CarbonInterface $to): array
    {
        $sales = Sale::query()
            ->where('business_id', $business->id)
            ->whereBetween('sold_at', [$from->startOfDay(), $to->endOfDay()])
            ->latest('sold_at')
            ->get();

        return [
            'summary' => [
                'tax_collected' => (float) $sales->sum('tax_amount'),
                'taxable_sales' => (float) $sales->sum('subtotal'),
                'sales_count' => $sales->count(),
            ],
            'chart' => $this->dailySeries($from, $to, $sales, 'sold_at', 'tax_amount'),
            'rows' => $sales->map(fn(Sale $sale): array => [
                'invoice' => $sale->invoice_number,
                'date' => $sale->sold_at?->toDateString(),
                'subtotal' => (float) $sale->subtotal,
                'tax' => (float) $sale->tax_amount,
                'total' => (float) $sale->grand_total,
            ])->values(),
        ];
    }

    private function dailySeries(CarbonInterface $from, CarbonInterface $to, Collection $items, string $dateColumn, string $valueColumn): array
    {
        $series = [];
        $cursor = Carbon::parse($from)->startOfDay();
        $end = Carbon::parse($to)->startOfDay();

        while ($cursor <= $end) {
            $date = $cursor->toDateString();
            $series[] = [
                'label' => DateHelper::label($cursor),
                'value' => (float) $items
                    ->filter(fn($item): bool => Carbon::parse(data_get($item, $dateColumn))->toDateString() === $date)
                    ->sum($valueColumn),
            ];
            $cursor = $cursor->addDay();
        }

        return $series;
    }

    private function mergeProfitSeries(array $sales, array $expenses): array
    {
        return collect($sales)->map(fn(array $point, int $index): array => [
            'label' => $point['label'],
            'value' => (float) $point['value'] - (float) ($expenses[$index]['value'] ?? 0),
        ])->values()->all();
    }

    public function formatSummary(array $summary): array
    {
        return collect($summary)->map(fn($value, $key): array => [
            'label' => str((string) $key)->replace('_', ' ')->title()->toString(),
            'value' => is_numeric($value) && ! str_contains((string) $key, 'count') && ! str_contains((string) $key, 'margin')
                ? CurrencyHelper::money($value)
                : (string) $value . (str_contains((string) $key, 'margin') ? '%' : ''),
        ])->values()->all();
    }
}
