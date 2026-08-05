<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Enums\PaymentStatus;
use App\Enums\SaleStatus;
use App\Events\InventoryLow;
use App\Events\SaleCompleted;
use App\Models\Business;
use App\Models\Payment;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleService
{
    public function __construct(
        private readonly CustomerCreditService $customerCreditService,
        private readonly PaymentService $paymentService,
        private readonly DiscountService $discountService,
    ) {}

    public function paginateForBusiness(Business $business, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return Sale::query()
            ->with(['customer', 'user', 'items.product'])
            ->where('business_id', $business->id)
            ->when($search, fn ($query) => $query->where('invoice_number', 'like', '%'.$search.'%'))
            ->latest('sold_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(Business $business, User $user, array $data): Sale
    {
        return DB::transaction(function () use ($business, $user, $data): Sale {
            $items = collect($data['items']);
            $products = Product::query()
                ->with('inventory')
                ->where('business_id', $business->id)
                ->whereIn('id', $items->pluck('product_id'))
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $saleItems = [];

            foreach ($items as $item) {
                $product = $products->get((int) $item['product_id']);

                if (! $product) {
                    throw ValidationException::withMessages(['items' => 'One or more products are invalid.']);
                }

                $quantity = (int) $item['quantity'];
                $inventory = Inventory::query()->whereKey($product->inventory?->id)->lockForUpdate()->first();

                if (! $inventory || $inventory->available_stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => $product->name.' does not have enough stock.',
                    ]);
                }

                $lineTotal = (float) $product->selling_price * $quantity;
                $subtotal += $lineTotal;
                $saleItems[] = compact('product', 'quantity', 'lineTotal', 'inventory');
            }

            $tax = (float) ($data['tax_amount'] ?? 0);
            $automaticDiscount = $this->discountService->calculate($business->loadMissing('owner'), collect($saleItems));
            $isManualDiscount = ($data['discount_type'] ?? null) === 'manual';
            $legacyManualDiscount = ! array_key_exists('enable_credit', $data) && (float) ($data['discount_amount'] ?? 0) > 0;
            if ($isManualDiscount && ! $legacyManualDiscount && ! $user->isOwner()) {
                throw ValidationException::withMessages(['discount_value' => 'Only business owners can override discounts.']);
            }
            $discount = $isManualDiscount
                ? (float) ($data['discount_value'] ?? 0)
                : ($legacyManualDiscount ? (float) $data['discount_amount'] : $automaticDiscount['amount']);
            $discount = min($discount, $subtotal + $tax);
            $grandTotal = max(0, $subtotal + $tax - $discount);

            $sale = Sale::create([
                'business_id' => $business->id,
                'customer_id' => $data['customer_id'] ?? null,
                'user_id' => $user->id,
                'invoice_number' => $this->nextInvoiceNumber($business),
                'subtotal' => $subtotal,
                'tax_amount' => $tax,
                'discount_amount' => $discount,
                'discount_type' => ($isManualDiscount || $legacyManualDiscount) ? 'manual' : $automaticDiscount['type'],
                'discount_value' => ($isManualDiscount || $legacyManualDiscount) ? $discount : $automaticDiscount['value'],
                'discount_rule_id' => ($isManualDiscount || $legacyManualDiscount) ? null : $automaticDiscount['rule_id'],
                'grand_total' => $grandTotal,
                'paid_amount' => 0,
                'balance_due' => $grandTotal,
                'status' => SaleStatus::Completed,
                'payment_status' => PaymentStatus::Unpaid,
                'notes' => $data['notes'] ?? null,
                'sold_at' => now(),
            ]);

            foreach ($saleItems as $item) {
                $sale->items()->create([
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['product']->selling_price,
                    'line_total' => $item['lineTotal'],
                ]);

                $before = (int) $item['inventory']->available_stock;
                $after = $before - $item['quantity'];
                $item['inventory']->forceFill([
                    'quantity' => $after,
                    'available_stock' => $after,
                    'updated_at' => now(),
                ])->save();

                $item['inventory']->transactions()->create([
                    'product_id' => $item['product']->id,
                    'business_id' => $business->id,
                    'user_id' => $user->id,
                    'type' => InventoryTransactionType::Sale,
                    'quantity_change' => -$item['quantity'],
                    'quantity_before' => $before,
                    'quantity_after' => $after,
                    'notes' => 'Sale '.$sale->invoice_number,
                ]);

                if ($after <= $item['product']->reorder_level) {
                    InventoryLow::dispatch($item['inventory']->refresh());
                }
            }

            $sale = $sale->load(['customer', 'user', 'items.product']);
            $this->customerCreditService->syncForSale($sale);
            SaleCompleted::dispatch($sale);

            return $sale;
        });
    }

    /**
     * Create the sale and its initial payment atomically from the POS checkout.
     *
     * @param array<string, mixed> $data
     * @return array{sale: Sale, payment: Payment}
     */
    public function checkout(Business $business, User $user, array $data): array
    {
        return DB::transaction(function () use ($business, $user, $data): array {
            $sale = $this->create($business, $user, $data);
            $amountReceived = (float) $data['amount_received'];
            $unpaid = max(0, (float) $sale->grand_total - min($amountReceived, (float) $sale->grand_total));

            if ($unpaid > 0 && (! $data['enable_credit'] || ! $sale->customer_id)) {
                throw ValidationException::withMessages([
                    'amount_received' => 'Full payment is required unless credit is enabled for a registered customer.',
                ]);
            }
            $payment = $this->paymentService->create($business, $user, [
                'sale_id' => $sale->id,
                // Cash received can exceed the sale total; the excess is change, not revenue.
                'amount' => min($amountReceived, (float) $sale->grand_total),
                'method' => $data['payment_method'],
                'reference' => $data['payment_reference'] ?? null,
                'notes' => $data['payment_notes'] ?? null,
            ]);

            return ['sale' => $sale->refresh(), 'payment' => $payment];
        });
    }

    protected function nextInvoiceNumber(Business $business): string
    {
        $prefix = 'INV-'.$business->id.'-'.now()->format('Ymd').'-';
        $next = Sale::query()->where('business_id', $business->id)->where('invoice_number', 'like', $prefix.'%')->count() + 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}
