<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Events\PaymentCompleted;
use App\Models\Business;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        private readonly CustomerCreditService $customerCreditService,
        private readonly ServiceFeeService $serviceFeeService,
    ) {}

    public function paginateForBusiness(Business $business, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return Payment::query()
            ->with(['sale', 'customer', 'user'])
            ->where('business_id', $business->id)
            ->when($search, fn ($query) => $query->where(fn ($searchQuery) => $searchQuery
                ->where('payment_number', 'like', '%'.$search.'%')
                ->orWhere('reference', 'like', '%'.$search.'%')
                ->orWhereHas('sale', fn ($saleQuery) => $saleQuery->where('invoice_number', 'like', '%'.$search.'%'))))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(Business $business, User $user, array $data): Payment
    {
        return DB::transaction(function () use ($business, $user, $data): Payment {
            $sale = Sale::query()
                ->where('business_id', $business->id)
                ->whereKey($data['sale_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $amount = (float) $data['amount'];
            $balanceDue = $this->balanceDue($sale);

            if ($amount > $balanceDue) {
                throw ValidationException::withMessages([
                    'amount' => 'Payment cannot exceed the remaining sale balance.',
                ]);
            }

            $method = PaymentMethod::from($data['method']);
            $status = $method === PaymentMethod::Cash ? PaymentStatus::Completed : PaymentStatus::Pending;

            $payment = Payment::create([
                'business_id' => $business->id,
                'sale_id' => $sale->id,
                'customer_id' => $sale->customer_id,
                'user_id' => $user->id,
                'payment_number' => $this->nextPaymentNumber($business),
                'method' => $method,
                'status' => $status,
                'amount' => $amount,
                'reference' => $data['reference'] ?? null,
                'notes' => $data['notes'] ?? null,
                'paid_at' => $status === PaymentStatus::Completed ? now() : null,
                'verified_at' => $status === PaymentStatus::Completed ? now() : null,
            ]);

            $this->syncSalePaymentStatus($sale);

            if ($status === PaymentStatus::Completed) {
                $this->serviceFeeService->createForPayment($payment);
                PaymentCompleted::dispatch($payment->load(['business.owner', 'sale', 'customer', 'user']));
            }

            return $payment->load(['sale', 'customer', 'user']);
        });
    }

    public function verify(Payment $payment, User $user, array $data): Payment
    {
        return DB::transaction(function () use ($payment, $user, $data): Payment {
            $payment = Payment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();

            if ($payment->status === PaymentStatus::Completed) {
                return $payment->load(['business.owner', 'sale', 'customer', 'user']);
            }

            $status = PaymentStatus::from($data['status']);
            $payment->forceFill([
                'status' => $status,
                'reference' => $data['reference'] ?? $payment->reference,
                'notes' => $data['notes'] ?? $payment->notes,
                'paid_at' => $status === PaymentStatus::Completed ? ($payment->paid_at ?? now()) : $payment->paid_at,
                'verified_at' => now(),
                'user_id' => $payment->user_id ?? $user->id,
            ])->save();

            $this->syncSalePaymentStatus($payment->sale()->lockForUpdate()->firstOrFail());

            if ($status === PaymentStatus::Completed) {
                $this->serviceFeeService->createForPayment($payment);
                PaymentCompleted::dispatch($payment->load(['business.owner', 'sale', 'customer', 'user']));
            }

            return $payment->load(['sale', 'customer', 'user']);
        });
    }

    public function syncSalePaymentStatus(Sale $sale): Sale
    {
        $paid = (float) $sale->payments()
            ->where('status', PaymentStatus::Completed->value)
            ->sum('amount');
        $grandTotal = (float) $sale->grand_total;
        $balance = max(0, $grandTotal - $paid);
        $status = match (true) {
            $paid <= 0 => PaymentStatus::Unpaid,
            $balance <= 0 => PaymentStatus::Completed,
            default => PaymentStatus::Partial,
        };

        $sale->forceFill([
            'paid_amount' => min($paid, $grandTotal),
            'balance_due' => $balance,
            'payment_status' => $status,
        ])->save();

        $this->customerCreditService->syncForSale($sale);

        return $sale->refresh();
    }

    protected function balanceDue(Sale $sale): float
    {
        $paid = (float) $sale->payments()
            ->where('status', PaymentStatus::Completed->value)
            ->sum('amount');

        return max(0, (float) $sale->grand_total - $paid);
    }

    protected function nextPaymentNumber(Business $business): string
    {
        $prefix = 'PAY-'.$business->id.'-'.now()->format('Ymd').'-';
        $next = Payment::query()->where('business_id', $business->id)->where('payment_number', 'like', $prefix.'%')->count() + 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}
