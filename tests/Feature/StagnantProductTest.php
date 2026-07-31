<?php

use App\Enums\ProductInsightStatus;
use App\Enums\ProductInsightType;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
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

function stockedProduct(Business $business, int $stock = 10): Product
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

test('command detects stagnant products and notifies owner', function () {
    NotificationFake::fake();
    [$owner, $business] = stagnantBusinessContext();
    $product = stockedProduct($business, 20);

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
    $product = stockedProduct($business, 12);
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
    stockedProduct($business, 20);

    $this->artisan('products:detect-stagnant', ['business' => $business->id])
        ->assertSuccessful();

    expect(ProductMovementInsight::query()->count())->toBe(0);
});

test('owner can view and update product insight status', function () {
    [$owner, $business] = stagnantBusinessContext();
    $product = stockedProduct($business, 8);
    $insight = ProductMovementInsight::factory()->create([
        'business_id' => $business->id,
        'product_id' => $product->id,
        'status' => ProductInsightStatus::Open,
    ]);

    $this->actingAs($owner)
        ->get(route('products.insights'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/insights')
            ->where('insights.total', 1)
            ->where('preferences.threshold_days', 30));

    $this->actingAs($owner)
        ->post(route('product-insights.dismiss', $insight))
        ->assertRedirect();

    expect($insight->refresh()->status)->toBe(ProductInsightStatus::Dismissed)
        ->and($insight->dismissed_at)->not->toBeNull();
});

test('cashier cannot manage product insights', function () {
    [, $business] = stagnantBusinessContext();
    $cashier = User::factory()->create(['role' => Role::Cashier, 'business_id' => $business->id]);

    $this->actingAs($cashier)
        ->get(route('products.insights'))
        ->assertForbidden();
});
