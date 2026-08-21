<?php

use App\Enums\ProductInsightStatus;
use App\Enums\ProductInsightType;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\InventoryBatch;
use App\Models\Inventory;
use App\Models\Notification;
use App\Models\Product;
use App\Models\ProductMovementInsight;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Notifications\StagnantProductNotification;
use Illuminate\Support\Facades\Notification as NotificationFake;

function stagnantBusinessContext(array $preferences = []): array
{
    $owner = User::factory()->create([
        'role' => Role::Owner,
        'preferences' => [
            'notify_stagnant_products' => true,
            'stagnant_product_days' => 30,
            'stagnant_product_minimum_stock' => 1,
            'stagnant_product_notification_frequency' => 7,
            ...$preferences,
        ],
    ]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function stagnantStockedProduct(Business $business, int $stock = 10): Product
{
    $product = Product::factory()->create([
        'business_id' => $business->id,
        'status' => RecordStatus::Active,
        'created_at' => now()->subDays(45),
    ]);

    Inventory::query()->updateOrCreate(
        ['product_id' => $product->id],
        ['quantity' => $stock, 'available_stock' => $stock],
    );

    return $product;
}

function stagnantPricedProduct(Business $business, int $stock = 10, float $unitCost = 80, float $sellingPrice = 100): Product
{
    $product = stagnantStockedProduct($business, $stock);
    InventoryBatch::factory()->create([
        'business_id' => $business->id,
        'product_id' => $product->id,
        'quantity_received' => $stock,
        'quantity_remaining' => $stock,
        'unit_cost' => $unitCost,
        'selling_price' => $sellingPrice,
        'received_at' => now()->subDays(10),
    ]);

    return $product->refresh();
}

test('command detects stagnant products and notifies owner', function () {
    NotificationFake::fake();
    [$owner, $business] = stagnantBusinessContext();
    $product = stagnantStockedProduct($business, 20);

    $this->artisan('products:detect-stagnant', ['business' => $business->id])
        ->assertSuccessful();

    $insight = ProductMovementInsight::query()->firstOrFail();

    expect($insight->product_id)->toBe($product->id)
        ->and($insight->type)->toBe(ProductInsightType::Stagnant)
        ->and($insight->status)->toBe(ProductInsightStatus::Open)
        ->and($insight->days_without_sale)->toBeGreaterThanOrEqual(30)
        ->and($insight->notified_at)->not->toBeNull();

    $this->assertDatabaseHas('notifications', [
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'type' => 'stagnant_product',
        'title' => 'Stagnant product detected',
    ]);

    NotificationFake::assertSentTo($owner, StagnantProductNotification::class);
});

test('recently sold products are not marked stagnant', function () {
    [$owner, $business] = stagnantBusinessContext();
    $product = stagnantStockedProduct($business, 12);
    $sale = Sale::factory()->create([
        'business_id' => $business->id,
        'user_id' => $owner->id,
        'sold_at' => now()->subDays(4),
    ]);
    SaleItem::factory()->create([
        'sale_id' => $sale->id,
        'product_id' => $product->id,
    ]);

    $this->artisan('products:detect-stagnant', ['business' => $business->id])
        ->assertSuccessful();

    expect(ProductMovementInsight::query()->count())->toBe(0)
        ->and(Notification::query()->where('type', 'stagnant_product')->count())->toBe(0);
});

test('business preferences can disable stagnant detection', function () {
    [, $business] = stagnantBusinessContext(['notify_stagnant_products' => false]);
    stagnantStockedProduct($business, 20);

    $this->artisan('products:detect-stagnant', ['business' => $business->id])
        ->assertSuccessful();

    expect(ProductMovementInsight::query()->count())->toBe(0);
});

test('owner can view and update product insight status', function () {
    [$owner, $business] = stagnantBusinessContext();
    $product = stagnantStockedProduct($business, 8);
    $insight = ProductMovementInsight::factory()->create([
        'business_id' => $business->id,
        'product_id' => $product->id,
        'status' => ProductInsightStatus::Open,
    ]);

    $this->actingAs($owner)
        ->get(route('products.show', $product))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/show')
            ->where('product.id', $product->id)
            ->where('product.movement_insights.0.id', $insight->id)
            ->where('preferences.threshold_days', 30));

    $this->actingAs($owner)
        ->post(route('product-insights.dismiss', $insight))
        ->assertRedirect();

    expect($insight->refresh()->status)->toBe(ProductInsightStatus::Dismissed)
        ->and($insight->dismissed_at)->not->toBeNull();
});

test('owner can apply a safe stagnant product discount', function () {
    [$owner, $business] = stagnantBusinessContext();
    $product = stagnantPricedProduct($business, 8, 80, 100);
    $insight = ProductMovementInsight::factory()->create([
        'business_id' => $business->id,
        'product_id' => $product->id,
        'status' => ProductInsightStatus::Open,
    ]);

    $this->actingAs($owner)
        ->post(route('product-insights.discount', $insight), [
            'discount_price' => 90,
            'discount_reason' => 'Move slow stock this week.',
        ])
        ->assertRedirect();

    expect((float) $insight->refresh()->discount_price)->toBe(90.0)
        ->and((float) $insight->discount_percent)->toBe(10.0)
        ->and($insight->allow_below_cost)->toBeFalse()
        ->and($insight->discount_applied_at)->not->toBeNull();

    $this->assertDatabaseHas('audit_logs', [
        'business_id' => $business->id,
        'action' => 'stagnant_discount_applied',
        'table_name' => 'product_movement_insights',
        'record_id' => $insight->id,
    ]);
});

test('stagnant discount below unit cost requires an override reason', function () {
    [$owner, $business] = stagnantBusinessContext();
    $product = stagnantPricedProduct($business, 8, 80, 100);
    $insight = ProductMovementInsight::factory()->create([
        'business_id' => $business->id,
        'product_id' => $product->id,
        'status' => ProductInsightStatus::Open,
    ]);

    $this->actingAs($owner)
        ->post(route('product-insights.discount', $insight), [
            'discount_price' => 70,
        ])
        ->assertSessionHasErrors('discount_price');

    $this->actingAs($owner)
        ->post(route('product-insights.discount', $insight), [
            'discount_price' => 70,
            'allow_below_cost' => true,
        ])
        ->assertSessionHasErrors('discount_reason');

    $this->actingAs($owner)
        ->post(route('product-insights.discount', $insight), [
            'discount_price' => 70,
            'allow_below_cost' => true,
            'discount_reason' => 'Expiry clearance approved by owner.',
        ])
        ->assertRedirect();

    expect((float) $insight->refresh()->discount_price)->toBe(70.0)
        ->and($insight->allow_below_cost)->toBeTrue();
});

test('sale uses active stagnant discount price', function () {
    [$owner, $business] = stagnantBusinessContext();
    $product = stagnantPricedProduct($business, 8, 80, 100);
    ProductMovementInsight::factory()->create([
        'business_id' => $business->id,
        'product_id' => $product->id,
        'status' => ProductInsightStatus::Open,
        'discount_price' => 90,
        'discount_percent' => 10,
        'discount_reason' => 'Move slow stock.',
        'discount_applied_at' => now(),
        'discount_applied_by' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect(route('sales.index'));

    $sale = Sale::query()->firstOrFail();

    expect((float) $sale->subtotal)->toBe(180.0)
        ->and((float) $sale->items()->first()->unit_price)->toBe(90.0);
});

test('cashier cannot manage product insights', function () {
    [, $business] = stagnantBusinessContext();
    $cashier = User::factory()->create(['role' => Role::Cashier, 'business_id' => $business->id]);

    $this->actingAs($cashier)
        ->get(route('products.show', Product::factory()->create(['business_id' => $business->id])))
        ->assertForbidden();
});
