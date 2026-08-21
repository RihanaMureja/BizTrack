<?php

use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\InventoryBatch;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

function creditSaleBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function creditSaleStockedProduct(Business $business, int $stock = 10, float $price = 100): Product
{
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create(['business_id' => $business->id, 'category_id' => $category->id]);
    $product->inventory->forceFill(['quantity' => $stock, 'available_stock' => $stock])->save();
    InventoryBatch::factory()->create([
        'product_id' => $product->id,
        'business_id' => $business->id,
        'quantity_received' => $stock,
        'quantity_remaining' => $stock,
        'unit_cost' => 40,
        'selling_price' => $price,
        'received_at' => now()->subDay(),
    ]);

    return $product->refresh();
}

test('normal customer sale does not create credit record', function () {
    [$owner, $business] = creditSaleBusinessContext();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'credit_limit' => 1000,
        'current_balance' => 0,
    ]);
    $product = creditSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'customer_id' => $customer->id,
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect(route('sales.index'));

    expect(CustomerCredit::query()->count())->toBe(0)
        ->and((float) $customer->refresh()->current_balance)->toBe(0.0);
});

test('credit sale creates credit record and updates balance when within approved limit', function () {
    [$owner, $business] = creditSaleBusinessContext();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'credit_limit' => 500,
        'current_balance' => 0,
    ]);
    $product = creditSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'customer_id' => $customer->id,
            'is_credit_sale' => true,
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect(route('sales.index'));

    $credit = CustomerCredit::query()->firstOrFail();

    expect((float) $credit->remaining_balance)->toBe(200.0)
        ->and((float) $customer->refresh()->current_balance)->toBe(200.0);
});

test('credit sale is blocked when it exceeds available credit', function () {
    [$owner, $business] = creditSaleBusinessContext();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'credit_limit' => 150,
        'current_balance' => 100,
    ]);
    $product = creditSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'customer_id' => $customer->id,
            'is_credit_sale' => true,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertSessionHasErrors('credit_amount');
});

test('owner can choose any cash and credit split within available credit', function () {
    [$owner, $business] = creditSaleBusinessContext();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'credit_limit' => 500,
        'current_balance' => 0,
    ]);
    $product = creditSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'customer_id' => $customer->id,
            'is_credit_sale' => true,
            'cash_amount' => 80,
            'credit_amount' => 120,
            'checkout_method' => 'cash',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect();

    $sale = Sale::query()->firstOrFail();
    $credit = CustomerCredit::query()->firstOrFail();
    $payment = Payment::query()->firstOrFail();

    expect((float) $sale->refresh()->paid_amount)->toBe(80.0)
        ->and((float) $sale->balance_due)->toBe(120.0)
        ->and((float) $sale->cash_amount)->toBe(80.0)
        ->and((float) $sale->credit_amount)->toBe(120.0)
        ->and((float) $payment->amount)->toBe(80.0)
        ->and((float) $credit->credit_amount)->toBe(120.0)
        ->and((float) $credit->remaining_balance)->toBe(120.0)
        ->and((float) $customer->refresh()->current_balance)->toBe(120.0);
});

test('split payment is rejected when cash and credit do not equal grand total', function () {
    [$owner, $business] = creditSaleBusinessContext();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'credit_limit' => 500,
        'current_balance' => 0,
    ]);
    $product = creditSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'customer_id' => $customer->id,
            'is_credit_sale' => true,
            'cash_amount' => 25,
            'credit_amount' => 50,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertSessionHasErrors('cash_amount');
});

test('sale can be entered as full credit when it fits available credit', function () {
    [$owner, $business] = creditSaleBusinessContext();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'credit_limit' => 500,
        'current_balance' => 0,
    ]);
    $product = creditSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'customer_id' => $customer->id,
            'is_credit_sale' => true,
            'cash_amount' => 0,
            'credit_amount' => 200,
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect(route('sales.index'));

    $sale = Sale::query()->firstOrFail();

    expect((float) $sale->paid_amount)->toBe(0.0)
        ->and((float) $sale->balance_due)->toBe(200.0)
        ->and((float) $sale->cash_amount)->toBe(0.0)
        ->and((float) $sale->credit_amount)->toBe(200.0)
        ->and((float) $customer->refresh()->current_balance)->toBe(200.0);
});

test('pending mobile money split does not overstate customer credit balance', function () {
    [$owner, $business] = creditSaleBusinessContext();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'credit_limit' => 500,
        'current_balance' => 0,
    ]);
    $product = creditSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'customer_id' => $customer->id,
            'is_credit_sale' => true,
            'cash_amount' => 80,
            'credit_amount' => 120,
            'checkout_method' => 'telebirr',
            'checkout_phone' => '0911222333',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect();

    $sale = Sale::query()->firstOrFail();
    $credit = CustomerCredit::query()->firstOrFail();
    $payment = Payment::query()->firstOrFail();

    expect((float) $payment->amount)->toBe(80.0)
        ->and($payment->status)->toBe(\App\Enums\PaymentStatus::Pending)
        ->and((float) $sale->refresh()->paid_amount)->toBe(0.0)
        ->and((float) $sale->balance_due)->toBe(200.0)
        ->and((float) $sale->credit_amount)->toBe(120.0)
        ->and((float) $credit->credit_amount)->toBe(120.0)
        ->and((float) $credit->remaining_balance)->toBe(120.0)
        ->and((float) $customer->refresh()->current_balance)->toBe(120.0);
});

test('pos checkout supports owner specified cash wallet and credit split', function () {
    [$owner, $business] = creditSaleBusinessContext();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'credit_limit' => 500,
        'current_balance' => 0,
    ]);
    $product = creditSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'customer_id' => $customer->id,
            'is_credit_sale' => true,
            'payment_lines' => [
                ['method' => 'cash', 'amount' => 50],
                ['method' => 'telebirr', 'amount' => 70, 'phone' => '+251911222333'],
                ['method' => 'credit', 'amount' => 80],
            ],
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect();

    $sale = Sale::query()->firstOrFail();
    $credit = CustomerCredit::query()->firstOrFail();

    expect((float) $sale->refresh()->paid_amount)->toBe(120.0)
        ->and((float) $sale->balance_due)->toBe(80.0)
        ->and((float) $sale->cash_amount)->toBe(120.0)
        ->and((float) $sale->credit_amount)->toBe(80.0)
        ->and(Payment::query()->count())->toBe(2)
        ->and(Payment::query()->where('method', 'telebirr')->firstOrFail()->gateway_reference)->toContain('+251911222333')
        ->and((float) $credit->credit_amount)->toBe(80.0)
        ->and((float) $credit->remaining_balance)->toBe(80.0)
        ->and((float) $customer->refresh()->current_balance)->toBe(80.0);
});
