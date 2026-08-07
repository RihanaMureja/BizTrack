<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Payment;

class PaymentReceiptService
{
    public function ensureReceipt(Payment $payment): Payment
    {
        $payment->loadMissing(['business', 'sale', 'customer']);

        $receiptNumber = $payment->receipt_number ?: $this->nextReceiptNumber($payment->business);

        $payment->forceFill([
            'receipt_number' => $receiptNumber,
            'qr_payload' => $this->qrPayload($payment, $receiptNumber),
        ])->save();

        return $payment->refresh();
    }

    /**
     * @return array<string, mixed>
     */
    public function details(Payment $payment): array
    {
        $payment = $this->ensureReceipt($payment);
        $payment->loadMissing([
            'business.owner',
            'sale.items.product',
            'customer',
            'user',
        ]);

        return [
            'business' => [
                'name' => $payment->business->business_name,
                'email' => $payment->business->email,
                'phone' => $payment->business->phone,
                'address' => $payment->business->address,
                'logo_url' => $payment->business->logo ? route('businesses.logo', $payment->business) : null,
                'tin' => $payment->business->national_id_fan_number,
                'is_vat_registered' => (bool) $payment->business->is_vat_registered,
            ],
            'payment' => [
                'id' => $payment->id,
                'payment_number' => $payment->payment_number,
                'receipt_number' => $payment->receipt_number,
                'method' => $payment->method->label(),
                'status' => $payment->status->label(),
                'amount' => (float) $payment->amount,
                'reference' => $payment->reference,
                'gateway_reference' => $payment->gateway_reference,
                'paid_at' => $payment->paid_at?->toDateTimeString(),
                'verified_at' => $payment->verified_at?->toDateTimeString(),
                'qr_payload' => $payment->qr_payload,
            ],
            'sale' => [
                'invoice_number' => $payment->sale->invoice_number,
                'subtotal' => (float) $payment->sale->subtotal,
                'discount_amount' => (float) $payment->sale->discount_amount,
                'tax_amount' => (float) $payment->sale->tax_amount,
                'vat_enabled' => (bool) $payment->sale->vat_enabled,
                'vat_rate' => (float) $payment->sale->vat_rate,
                'grand_total' => (float) $payment->sale->grand_total,
                'paid_amount' => (float) $payment->sale->paid_amount,
                'balance_due' => (float) $payment->sale->balance_due,
                'sold_at' => $payment->sale->sold_at?->toDateTimeString(),
            ],
            'customer' => [
                'name' => $payment->customer?->display_name ?? 'Walk-in customer',
                'phone' => $payment->customer?->phone,
                'email' => $payment->customer?->email,
            ],
            'cashier' => [
                'name' => $payment->user?->name ?? 'System',
            ],
            'items' => $payment->sale->items->map(fn ($item): array => [
                'name' => $item->product?->name ?? 'Deleted product',
                'quantity' => (int) $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'line_total' => (float) $item->line_total,
            ])->values(),
        ];
    }

    private function nextReceiptNumber(Business $business): string
    {
        $prefix = 'RCT-'.$business->id.'-'.now()->format('Ymd').'-';
        $next = Payment::query()
            ->where('business_id', $business->id)
            ->where('receipt_number', 'like', $prefix.'%')
            ->count() + 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    /**
     * @return array<string, mixed>
     */
    private function qrPayload(Payment $payment, string $receiptNumber): array
    {
        return [
            'type' => 'biztrack.payment_receipt',
            'business_id' => $payment->business_id,
            'payment_id' => $payment->id,
            'payment_number' => $payment->payment_number,
            'receipt_number' => $receiptNumber,
            'invoice_number' => $payment->sale?->invoice_number,
            'amount' => (float) $payment->amount,
            'status' => $payment->status->value,
            'issued_at' => now()->toISOString(),
        ];
    }
}
