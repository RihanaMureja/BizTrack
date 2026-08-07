<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

function receiptBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function receiptSale(Business $business, User $user): Sale
{
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $category->id,
        'selling_price' => 75,
    ]);
    $product->inventory->forceFill(['quantity' => 5, 'available_stock' => 5])->save();

    return Sale::factory()
        ->hasItems(1, [
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 75,
            'line_total' => 150,
        ])
        ->create([
            'business_id' => $business->id,
            'user_id' => $user->id,
            'subtotal' => 150,
            'grand_total' => 150,
            'paid_amount' => 0,
            'balance_due' => 150,
            'payment_status' => PaymentStatus::Unpaid,
        ]);
}

test('completed checkout payment receives receipt number and qr payload', function () {
    [$owner, $business] = receiptBusinessContext();
    $sale = receiptSale($business, $owner);

    $this->actingAs($owner)
        ->post(route('sales.checkout.store', $sale), [
            'amount' => 150,
            'method' => PaymentMethod::Cash->value,
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();

    expect($payment->receipt_number)->toStartWith('RCT-'.$business->id)
        ->and($payment->qr_payload['type'])->toBe('biztrack.payment_receipt')
        ->and($payment->qr_payload['payment_number'])->toBe($payment->payment_number)
        ->and($payment->qr_payload['status'])->toBe(PaymentStatus::Completed->value);
});

test('owner can open receipt preview for own business payment', function () {
    [$owner, $business] = receiptBusinessContext();
    $sale = receiptSale($business, $owner);
    $payment = Payment::factory()->create([
        'business_id' => $business->id,
        'sale_id' => $sale->id,
        'user_id' => $owner->id,
        'amount' => 150,
    ]);

    $this->actingAs($owner)
        ->getJson(route('payments.receipt.show', $payment))
        ->assertOk()
        ->assertJsonPath('payment.payment_number', $payment->payment_number)
        ->assertJsonPath('sale.invoice_number', $sale->invoice_number)
        ->assertJsonPath('items.0.name', $sale->items->first()->product->name);
});

test('user cannot open another business payment receipt', function () {
    [$owner, $business] = receiptBusinessContext();
    $sale = receiptSale($business, $owner);
    $payment = Payment::factory()->create([
        'business_id' => $business->id,
        'sale_id' => $sale->id,
    ]);
    [$otherOwner] = receiptBusinessContext();

    $this->actingAs($otherOwner)
        ->getJson(route('payments.receipt.show', $payment))
        ->assertForbidden();
});

test('verifying pending payment refreshes receipt qr status', function () {
    [$owner, $business] = receiptBusinessContext();
    $sale = receiptSale($business, $owner);

    $this->actingAs($owner)
        ->post(route('sales.checkout.store', $sale), [
            'amount' => 100,
            'method' => PaymentMethod::Telebirr->value,
            'phone' => '0911222333',
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();
    expect($payment->qr_payload['status'])->toBe(PaymentStatus::Pending->value);

    $this->actingAs($owner)
        ->post(route('payments.verify', $payment), [
            'status' => PaymentStatus::Completed->value,
            'reference' => 'TEL-OK',
        ])
        ->assertRedirect();

    expect($payment->refresh()->qr_payload['status'])->toBe(PaymentStatus::Completed->value);
});
