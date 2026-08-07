<?php

use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\InventoryBatch;
use App\Models\Product;
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
    $product = Product::factory()->create(['business_id' => $business->id, 'category_id' => $category->id, 'selling_price' => $price]);
    $product->inventory->forceFill(['quantity' => $stock, 'available_stock' => $stock])->save();
    InventoryBatch::factory()->create([
        'product_id' => $product->id,
        'business_id' => $business->id,
        'quantity_received' => $stock,
        'quantity_remaining' => $stock,
        'unit_cost' => $product->buy_price,
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
        ->assertSessionHasErrors('is_credit_sale');
});
