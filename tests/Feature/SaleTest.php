<?php

use App\Enums\Role;
use App\Enums\SaleStatus;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use App\Events\SaleCompleted;

function saleBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();
    return [$owner, $business];
}

function stockedProduct(Business $business, int $stock = 10, float $price = 25): Product
{
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create(['business_id' => $business->id, 'category_id' => $category->id, 'selling_price' => $price]);
    $product->inventory->forceFill(['quantity' => $stock, 'available_stock' => $stock])->save();
    return $product->refresh();
}

test('guests are redirected to login', function () {
    $this->get(route('sales.index'))->assertRedirect(route('login'));
});

test('owner can open pos screen', function () {
    [$owner, $business] = saleBusinessContext();
    stockedProduct($business);

    $this->actingAs($owner)
        ->get(route('sales.pos'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('sales/pos')->has('products', 1));
});

test('cashier can create sale and inventory is reduced', function () {
    Event::fake([SaleCompleted::class]);
    [$owner, $business] = saleBusinessContext();
    $cashier = User::factory()->create(['business_id' => $business->id, 'role' => Role::Cashier]);
    $customer = Customer::factory()->create(['business_id' => $business->id]);
    $product = stockedProduct($business, 10, 25);

    $this->actingAs($cashier)
        ->post(route('sales.store'), [
            'customer_id' => $customer->id,
            'tax_amount' => 5,
            'discount_amount' => 10,
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect(route('sales.index'));

    $sale = Sale::query()->firstOrFail();
    expect((float) $sale->subtotal)->toBe(50.0)
        ->and((float) $sale->grand_total)->toBe(45.0)
        ->and($sale->status)->toBe(SaleStatus::Completed)
        ->and($product->inventory->refresh()->available_stock)->toBe(8);

    $this->assertDatabaseHas('sale_items', ['sale_id' => $sale->id, 'product_id' => $product->id, 'quantity' => 2]);
    $this->assertDatabaseHas('inventory_transactions', ['product_id' => $product->id, 'quantity_change' => -2]);
    Event::assertDispatched(SaleCompleted::class);
});

test('sale fails when stock is not enough', function () {
    [$owner, $business] = saleBusinessContext();
    $product = stockedProduct($business, 1, 25);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertSessionHasErrors('items');

    expect($product->inventory->refresh()->available_stock)->toBe(1);
});

test('owner cannot sell another business product', function () {
    [$owner] = saleBusinessContext();
    [, $otherBusiness] = saleBusinessContext();
    $product = stockedProduct($otherBusiness);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertSessionHasErrors('items.0.product_id');
});

test('owner can view sales list and receipt', function () {
    [$owner, $business] = saleBusinessContext();
    $sale = Sale::factory()->create(['business_id' => $business->id, 'user_id' => $owner->id]);

    $this->actingAs($owner)->get(route('sales.index'))->assertOk()->assertInertia(fn ($page) => $page->component('sales/index')->where('sales.total', 1));
    $this->actingAs($owner)->get(route('sales.show', $sale))->assertOk()->assertInertia(fn ($page) => $page->component('sales/show')->where('sale.id', $sale->id));
});
