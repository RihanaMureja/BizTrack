<?php

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;

function productOwnerWithBusiness(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function validProductPayload(array $overrides = []): array
{
    return [
        'category_id' => null,
        'name' => 'Bottled Water 500ml',
        'barcode' => 'BW500001',
        'description' => 'Clean bottled water',
        'buy_price' => 8,
        'selling_price' => 12,
        'reorder_level' => 20,
        'status' => RecordStatus::Active->value,
        ...$overrides,
    ];
}

test('guests are redirected to the login page', function () {
    $this->get(route('products.index'))->assertRedirect(route('login'));
});

test('cashiers cannot manage products', function () {
    $cashier = User::factory()->create(['role' => Role::Cashier]);

    $this->actingAs($cashier)
        ->get(route('products.index'))
        ->assertForbidden();
});

test('owner can view product list', function () {
    [$owner, $business] = productOwnerWithBusiness();
    Product::factory()->count(2)->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->get(route('products.index'))
        ->assertOk();
});

test('owner can create a product and inventory record is created automatically', function () {
    [$owner, $business] = productOwnerWithBusiness();
    $category = Category::factory()->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->post(route('products.store'), validProductPayload(['category_id' => $category->id]))
        ->assertRedirect();

    $product = Product::query()->where('barcode', 'BW500001')->firstOrFail();

    expect($product->business_id)->toBe($business->id)
        ->and($product->inventory)->not->toBeNull()
        ->and($product->inventory->available_stock)->toBe(0);
});

test('product barcode must be unique per business', function () {
    [$owner, $business] = productOwnerWithBusiness();
    Product::factory()->create(['business_id' => $business->id, 'barcode' => 'DUP001']);

    $this->actingAs($owner)
        ->post(route('products.store'), validProductPayload(['barcode' => 'DUP001']))
        ->assertSessionHasErrors('barcode');
});

test('product category must belong to owner business', function () {
    [$owner] = productOwnerWithBusiness();
    $otherCategory = Category::factory()->create();

    $this->actingAs($owner)
        ->post(route('products.store'), validProductPayload(['category_id' => $otherCategory->id]))
        ->assertSessionHasErrors('category_id');
});

test('selling price must be greater than or equal to buy price', function () {
    [$owner] = productOwnerWithBusiness();

    $this->actingAs($owner)
        ->post(route('products.store'), validProductPayload([
            'buy_price' => 20,
            'selling_price' => 10,
        ]))
        ->assertSessionHasErrors('selling_price');
});

test('owner can update their own product', function () {
    [$owner, $business] = productOwnerWithBusiness();
    $product = Product::factory()->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->put(route('products.update', $product), validProductPayload([
            'name' => 'Updated Product',
            'barcode' => $product->barcode,
        ]))
        ->assertRedirect();

    expect($product->refresh()->name)->toBe('Updated Product');
});

test('owner cannot update another business product', function () {
    [$owner] = productOwnerWithBusiness();
    $otherProduct = Product::factory()->create();

    $this->actingAs($owner)
        ->put(route('products.update', $otherProduct), validProductPayload())
        ->assertForbidden();
});

test('owner can deactivate a product', function () {
    [$owner, $business] = productOwnerWithBusiness();
    $product = Product::factory()->create(['business_id' => $business->id, 'status' => RecordStatus::Active]);

    $this->actingAs($owner)
        ->delete(route('products.destroy', $product))
        ->assertRedirect();

    expect($product->refresh()->status)->toBe(RecordStatus::Inactive);
});

test('owner can search products by barcode and filter by category', function () {
    [$owner, $business] = productOwnerWithBusiness();
    $matchingCategory = Category::factory()->create(['business_id' => $business->id]);
    $otherCategory = Category::factory()->create(['business_id' => $business->id]);

    Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $matchingCategory->id,
        'name' => 'Filtered Product',
        'barcode' => 'FILT001',
    ]);
    Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $otherCategory->id,
        'name' => 'Other Product',
        'barcode' => 'OTHER001',
    ]);

    $this->actingAs($owner)
        ->get(route('products.index', [
            'search' => 'FILT001',
            'category_id' => $matchingCategory->id,
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/index')
            ->where('products.data.0.name', 'Filtered Product')
            ->where('products.total', 1)
        );
});
