<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Models\Business;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ProductReportService
{
    /**
     * @return array<string, mixed>
     */
    public function productDetail(Business $business, Product $product, CarbonInterface $from, CarbonInterface $to): array
    {
        $items = SaleItem::query()
            ->with('sale:id,business_id,invoice_number,sold_at')
            ->where('product_id', $product->id)
            ->whereHas('sale', fn ($query) => $query
                ->where('business_id', $business->id)
                ->whereBetween('sold_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()]))
            ->get();

        $revenue = (float) $items->sum('line_total');
        $quantity = (int) $items->sum('quantity');
        $cost = $this->batchCostForItems($items);

        return [
            'product' => $product->loadMissing('category'),
            'summary' => [
                'quantity_sold' => $quantity,
                'revenue' => $revenue,
                'batch_cost' => $cost,
                'profit' => $revenue - $cost,
                'margin' => $revenue > 0 ? round((($revenue - $cost) / $revenue) * 100, 2) : 0,
            ],
            'trend' => $this->trend($items, $from, $to),
            'sales' => $items
                ->groupBy('sale_id')
                ->map(fn (Collection $saleItems): array => [
                    'invoice' => $saleItems->first()->sale?->invoice_number,
                    'date' => $saleItems->first()->sale?->sold_at?->toDateString(),
                    'quantity' => (int) $saleItems->sum('quantity'),
                    'revenue' => (float) $saleItems->sum('line_total'),
                    'cost' => $this->batchCostForItems($saleItems),
                ])
                ->values(),
        ];
    }

    /**
     * @return list<array{label: string, quantity: int, revenue: float}>
     */
    private function trend(Collection $items, CarbonInterface $from, CarbonInterface $to): array
    {
        $series = [];
        $cursor = Carbon::parse($from)->startOfDay();
        $end = Carbon::parse($to)->startOfDay();

        while ($cursor <= $end) {
            $date = $cursor->toDateString();
            $dayItems = $items->filter(fn (SaleItem $item): bool => $item->sale?->sold_at?->toDateString() === $date);
            $series[] = [
                'label' => $cursor->format('M d'),
                'quantity' => (int) $dayItems->sum('quantity'),
                'revenue' => (float) $dayItems->sum('line_total'),
            ];
            $cursor = $cursor->addDay();
        }

        return $series;
    }

    public function batchCostForItems(Collection $items): float
    {
        return (float) $items->sum(function (SaleItem $item): float {
            $invoice = $item->sale?->invoice_number;

            if (! $invoice) {
                return 0;
            }

            return (float) InventoryTransaction::query()
                ->where('product_id', $item->product_id)
                ->where('type', InventoryTransactionType::Sale)
                ->where('notes', 'Sale '.$invoice)
                ->with('batch:id,unit_cost')
                ->get()
                ->sum(fn (InventoryTransaction $transaction): float => abs((int) $transaction->quantity_change) * (float) ($transaction->batch?->unit_cost ?? 0));
        });
    }
}
