<?php

use App\Enums\BusinessAccessMode;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;

function productReportContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
        'access_mode' => BusinessAccessMode::Active,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('product report profit uses real fifo batch cost data', function () {
    [$owner, $business] = productReportContext();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $category->id,
        'selling_price' => 100,
    ]);

    $this->actingAs($owner)
        ->post(route('inventory.restock', $product->inventory), ['quantity' => 2, 'unit_cost' => 20, 'received_at' => now()->subDays(2)->toDateString()])
        ->assertRedirect();
    $this->actingAs($owner)
        ->post(route('inventory.restock', $product->inventory), ['quantity' => 2, 'unit_cost' => 60, 'received_at' => now()->subDay()->toDateString()])
        ->assertRedirect();

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'items' => [['product_id' => $product->id, 'quantity' => 3]],
        ])
        ->assertRedirect();

    $this->actingAs($owner)
        ->get(route('reports.products.show', [
            'product' => $product,
            'date_from' => today()->subDay()->toDateString(),
            'date_to' => today()->toDateString(),
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/products')
            ->where('report.summary.revenue', 300)
            ->where('report.summary.batch_cost', 100)
            ->where('report.summary.profit', 200)
            ->has('report.trend'));
});

test('reports are filterable by category and expose product drill down links', function () {
    [$owner, $business] = productReportContext();
    $drinks = Category::factory()->create(['business_id' => $business->id, 'name' => 'Drinks']);
    $snacks = Category::factory()->create(['business_id' => $business->id, 'name' => 'Snacks']);
    $drink = Product::factory()->create(['business_id' => $business->id, 'category_id' => $drinks->id, 'name' => 'Filtered Juice', 'selling_price' => 40]);
    $snack = Product::factory()->create(['business_id' => $business->id, 'category_id' => $snacks->id, 'name' => 'Hidden Biscuit', 'selling_price' => 30]);

    foreach ([$drink, $snack] as $product) {
        $this->actingAs($owner)
            ->post(route('inventory.restock', $product->inventory), ['quantity' => 5, 'unit_cost' => 10])
            ->assertRedirect();
        $this->actingAs($owner)
            ->post(route('sales.store'), ['items' => [['product_id' => $product->id, 'quantity' => 1]]])
            ->assertRedirect();
    }

    $this->actingAs($owner)
        ->get(route('reports.index', [
            'type' => 'sales',
            'category_id' => $drinks->id,
            'date_from' => today()->subDay()->toDateString(),
            'date_to' => today()->toDateString(),
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->where('report.topProducts.0.id', $drink->id)
            ->where('report.topProducts.0.name', 'Filtered Juice')
            ->where('report.productProfit.0.cost', 10)
            ->where('filters.category_id', $drinks->id));
});
