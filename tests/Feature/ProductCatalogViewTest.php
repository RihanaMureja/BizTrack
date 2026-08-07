<?php

use App\Enums\ProductInsightStatus;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductMovementInsight;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;

function catalogOwnerContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('products navigation is a single item without product insights', function () {
    [$owner] = catalogOwnerContext();

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('navigation', fn ($navigation) => collect($navigation)
                ->where('title', 'Products')
                ->count() === 1
                && ! collect($navigation)->pluck('title')->contains('Product Insights')));
});

test('product catalog returns card data with 30 day sales trend', function () {
    [$owner, $business] = catalogOwnerContext();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $category->id,
        'name' => 'Sparkline Water',
    ]);
    $sale = Sale::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'sold_at' => now()->subDays(2),
    ]);
    SaleItem::factory()->create([
        'sale_id' => $sale->id,
        'product_id' => $product->id,
        'quantity' => 4,
    ]);

    $this->actingAs($owner)
        ->get(route('products.index', [
            'search' => 'Sparkline',
            'category_id' => $category->id,
            'sort' => 'name',
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/index')
            ->where('products.total', 1)
            ->where('products.data.0.id', $product->id)
            ->has('products.data.0.sales_trend', 30));
});

test('product detail exposes full stagnant insight inside product module', function () {
    [$owner, $business] = catalogOwnerContext();
    $product = Product::factory()->create(['business_id' => $business->id]);
    $insight = ProductMovementInsight::factory()->create([
        'business_id' => $business->id,
        'product_id' => $product->id,
        'status' => ProductInsightStatus::Open,
        'suggested_action' => 'Discount this item this weekend.',
    ]);

    $this->actingAs($owner)
        ->get(route('products.show', $product))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/show')
            ->where('product.id', $product->id)
            ->where('product.movement_insights.0.id', $insight->id)
            ->where('product.movement_insights.0.suggested_action', 'Discount this item this weekend.'));
});

test('separate product insights route no longer exists', function () {
    [$owner] = catalogOwnerContext();

    $this->actingAs($owner)
        ->get('/products/insights')
        ->assertNotFound();
});
