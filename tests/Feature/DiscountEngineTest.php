<?php

use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\DiscountRule;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

function discountBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function discountStockedProduct(Business $business, int $stock = 10, float $price = 100): Product
{
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $category->id,
        'selling_price' => $price,
    ]);
    InventoryBatch::factory()->create([
        'product_id' => $product->id,
        'business_id' => $business->id,
        'quantity_received' => $stock,
        'quantity_remaining' => $stock,
        'unit_cost' => $product->buy_price,
        'received_at' => now()->subDay(),
    ]);
    $product->inventory->forceFill(['quantity' => $stock, 'available_stock' => $stock])->save();

    return $product->refresh();
}

test('owner can create tiered discount rule', function () {
    [$owner, $business] = discountBusinessContext();

    $this->actingAs($owner)
        ->post(route('credit-discounts.rules.store'), [
            'name' => 'Monthly loyal buyer',
            'spend_threshold' => 5000,
            'discount_percent' => 5,
            'is_active' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('discount_rules', [
        'business_id' => $business->id,
        'name' => 'Monthly loyal buyer',
        'discount_percent' => 5,
    ]);
});

test('discount applies automatically at point of sale when customer qualifies', function () {
    [$owner, $business] = discountBusinessContext();
    $customer = Customer::factory()->create([
        'business_id' => $business->id,
        'display_name' => 'Loyal Customer',
        'full_name' => 'Loyal Customer',
    ]);
    Sale::factory()->create([
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'user_id' => $owner->id,
        'subtotal' => 6000,
        'grand_total' => 6000,
        'sold_at' => now()->subDays(5),
    ]);
    DiscountRule::factory()->create([
        'business_id' => $business->id,
        'name' => 'Five percent loyalty',
        'spend_threshold' => 5000,
        'discount_percent' => 5,
        'is_active' => true,
    ]);
    $product = discountStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'customer_id' => $customer->id,
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect(route('sales.index'));

    $sale = Sale::query()->latest('id')->firstOrFail();

    expect((float) $sale->subtotal)->toBe(200.0)
        ->and((float) $sale->discount_amount)->toBe(10.0)
        ->and((float) $sale->grand_total)->toBe(190.0);
});

test('credit discounts page is a single owner module', function () {
    [$owner, $business] = discountBusinessContext();
    DiscountRule::factory()->create(['business_id' => $business->id]);
    Customer::factory()->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->get(route('credit-discounts.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('credit-discounts/index')
            ->has('discountRules', 1)
            ->has('creditProfiles', 1)
        );
});
