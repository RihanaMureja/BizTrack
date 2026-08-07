<?php

use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\User;

function vatSaleBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function vatSaleStockedProduct(Business $business, int $stock = 10, float $price = 100): Product
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

test('vat registered business can apply vat automatically to taxable sale amount', function () {
    [$owner, $business] = vatSaleBusinessContext();
    $business->forceFill(['is_vat_registered' => true])->save();
    $product = vatSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'apply_vat' => true,
            'discount_amount' => 20,
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect(route('sales.index'));

    $sale = \App\Models\Sale::query()->firstOrFail();

    expect((float) $sale->subtotal)->toBe(200.0)
        ->and((float) $sale->discount_amount)->toBe(20.0)
        ->and($sale->vat_enabled)->toBeTrue()
        ->and((float) $sale->vat_rate)->toBe(15.0)
        ->and((float) $sale->tax_amount)->toBe(27.0)
        ->and((float) $sale->grand_total)->toBe(207.0);
});

test('non vat registered business cannot add vat even if request asks for it', function () {
    [$owner, $business] = vatSaleBusinessContext();
    $business->forceFill(['is_vat_registered' => false])->save();
    $product = vatSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'apply_vat' => true,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertRedirect(route('sales.index'));

    $sale = \App\Models\Sale::query()->firstOrFail();

    expect($sale->vat_enabled)->toBeFalse()
        ->and((float) $sale->tax_amount)->toBe(0.0)
        ->and((float) $sale->grand_total)->toBe(100.0);
});

test('manual tax amount is rejected on sale creation', function () {
    [$owner, $business] = vatSaleBusinessContext();
    $product = vatSaleStockedProduct($business, 10, 100);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'tax_amount' => 15,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertSessionHasErrors('tax_amount');
});
