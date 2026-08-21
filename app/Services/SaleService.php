<?php

namespace App\Services;

use App\Enums\InventoryTransactionType;
use App\Enums\PaymentStatus;
use App\Enums\SaleStatus;
use App\Events\SaleCompleted;
use App\Models\Business;
use App\Models\Customer;
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
        private readonly FifoStockAllocationService $fifoStockAllocationService,
        private readonly DiscountEngineService $discountEngineService,
        private readonly ProductPricingService $productPricingService,
        private readonly PaymentService $paymentService,
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
                ->with(['inventory', 'latestAvailableBatch'])
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

                $unitPrice = $this->productPricingService->priceFor($product)['effective_price'];

                if ($unitPrice <= 0) {
                    throw ValidationException::withMessages([
                        'items' => $product->name.' must be restocked with a selling price before it can be sold.',
                    ]);
                }

                $lineTotal = $unitPrice * $quantity;
                $subtotal += $lineTotal;
                $saleItems[] = compact('product', 'quantity', 'unitPrice', 'lineTotal', 'inventory');
            }

            $customer = ! empty($data['customer_id'])
                ? $business->customers()->whereKey($data['customer_id'])->first()
                : null;
            $tax = 0.0;
            $discount = (float) ($data['discount_amount'] ?? 0);

            if ($customer) {
                $discount = max($discount, $this->discountEngineService->automaticDiscount($customer, $subtotal));
            }

            if ($discount > $subtotal) {
                throw ValidationException::withMessages([
                    'discount_amount' => 'Discount cannot exceed the sale subtotal.',
                ]);
            }

            $taxableAmount = max(0, $subtotal - $discount);
            $vatEnabled = (bool) ($data['apply_vat'] ?? false) && (bool) $business->is_vat_registered;
            $vatRate = $vatEnabled ? 15.0 : 0.0;
            $tax = $vatEnabled ? round($taxableAmount * ($vatRate / 100), 2) : 0.0;
            $grandTotal = $taxableAmount + $tax;
            $split = $this->paymentSplit($data, $grandTotal);
            $isCreditSale = $split['credit'] > 0;

            if ($isCreditSale) {
                $this->validateCreditSale($customer, $split['credit']);
            }

            $sale = Sale::create([
                'business_id' => $business->id,
                'customer_id' => $customer?->id,
                'user_id' => $user->id,
                'invoice_number' => $this->nextInvoiceNumber($business),
                'is_credit_sale' => $isCreditSale,
                'cash_amount' => $split['cash'],
                'credit_amount' => $split['credit'],
                'subtotal' => $subtotal,
                'tax_amount' => $tax,
                'discount_amount' => $discount,
                'vat_enabled' => $vatEnabled,
                'vat_rate' => $vatRate,
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
                    'unit_price' => $item['unitPrice'],
                    'line_total' => $item['lineTotal'],
                ]);

                $this->fifoStockAllocationService->deduct(
                    $item['inventory'],
                    $item['quantity'],
                    InventoryTransactionType::Sale,
                    'Sale '.$sale->invoice_number,
                    $user,
                );
            }

            $sale = $sale->load(['customer', 'user', 'items.product']);

            foreach ($split['payments'] as $paymentLine) {
                $this->paymentService->createCompletedSalePayment($sale, $user, [
                    ...$paymentLine,
                    'notes' => $data['notes'] ?? null,
                ]);
            }

            if ($split['payments'] !== []) {
                $sale = $this->paymentService->syncSaleAfterPayments($sale);
            }

            $this->customerCreditService->syncForSale($sale);
            SaleCompleted::dispatch($sale);

            return $sale;
        });
    }

    protected function nextInvoiceNumber(Business $business): string
    {
        $prefix = 'INV-'.$business->id.'-'.now()->format('Ymd').'-';
        $next = Sale::query()->where('business_id', $business->id)->where('invoice_number', 'like', $prefix.'%')->count() + 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    private function validateCreditSale(?Customer $customer, float $grandTotal): void
    {
        if (! $customer) {
            throw ValidationException::withMessages([
                'customer_id' => 'Select a customer before selling on credit.',
            ]);
        }

        $availableCredit = max(0, (float) $customer->credit_limit - (float) $customer->current_balance);

        if ($grandTotal > $availableCredit) {
            throw ValidationException::withMessages([
                'credit_amount' => 'Credit amount exceeds the customer available credit.',
            ]);
        }
    }

    /**
     * @param array<string, mixed> $data
     * @return array{cash: float, credit: float, payments: array<int, array<string, mixed>>}
     */
    private function paymentSplit(array $data, float $grandTotal): array
    {
        if (! empty($data['payment_lines']) && is_array($data['payment_lines'])) {
            return $this->paymentLinesSplit($data, $grandTotal);
        }

        $hasCashAmount = array_key_exists('cash_amount', $data) && $data['cash_amount'] !== null && $data['cash_amount'] !== '';
        $hasCreditAmount = array_key_exists('credit_amount', $data) && $data['credit_amount'] !== null && $data['credit_amount'] !== '';
        $isCreditSale = (bool) ($data['is_credit_sale'] ?? false);

        if (! $hasCashAmount && ! $hasCreditAmount) {
            return [
                'cash' => $isCreditSale ? 0.0 : $grandTotal,
                'credit' => $isCreditSale ? $grandTotal : 0.0,
                'payments' => [],
            ];
        }

        $cashAmount = round((float) ($data['cash_amount'] ?? 0), 2);
        $creditAmount = round((float) ($data['credit_amount'] ?? 0), 2);

        if (! $isCreditSale && $creditAmount > 0) {
            throw ValidationException::withMessages([
                'is_credit_sale' => 'Enable credit sale before assigning part of the sale to customer credit.',
            ]);
        }

        if (round($cashAmount + $creditAmount, 2) !== round($grandTotal, 2)) {
            throw ValidationException::withMessages([
                'cash_amount' => 'Pay now amount plus credit amount must equal the sale total.',
            ]);
        }

        return ['cash' => $cashAmount, 'credit' => $creditAmount, 'payments' => []];
    }

    /**
     * @param array<string, mixed> $data
     * @return array{cash: float, credit: float, payments: array<int, array<string, mixed>>}
     */
    private function paymentLinesSplit(array $data, float $grandTotal): array
    {
        $payments = [];
        $payNowAmount = 0.0;
        $creditAmount = 0.0;

        foreach ($data['payment_lines'] as $line) {
            $amount = round((float) ($line['amount'] ?? 0), 2);

            if ($amount <= 0) {
                continue;
            }

            $method = (string) ($line['method'] ?? '');

            if ($method === 'credit') {
                $creditAmount += $amount;

                continue;
            }

            $payNowAmount += $amount;
            $payments[] = [
                'method' => $method,
                'amount' => $amount,
                'phone' => $line['phone'] ?? null,
                'account_number' => $line['account_number'] ?? null,
                'reference' => $line['reference'] ?? null,
            ];
        }

        if ($creditAmount > 0 && ! (bool) ($data['is_credit_sale'] ?? false)) {
            throw ValidationException::withMessages([
                'is_credit_sale' => 'Enable credit sale before assigning part of the sale to customer credit.',
            ]);
        }

        if (round($payNowAmount + $creditAmount, 2) !== round($grandTotal, 2)) {
            throw ValidationException::withMessages([
                'payment_lines' => 'Cash, wallet, account, and credit amounts must equal the sale total.',
            ]);
        }

        return [
            'cash' => round($payNowAmount, 2),
            'credit' => round($creditAmount, 2),
            'payments' => $payments,
        ];
    }
}
