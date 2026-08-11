<?php

use App\Enums\BusinessSubscriptionStatus;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Enums\SaleStatus;
use App\Models\Business;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $business = Business::factory()->create([
        'owner_id' => $user->id,
        'status' => RecordStatus::Active,
    ]);
    $user->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

function dashboardOwner(array $overrides = []): User
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'subscription_status' => BusinessSubscriptionStatus::Active,
        ...$overrides,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return $owner;
}

test('owner dashboard sections follow the stored grocery business type', function () {
    $this->actingAs(dashboardOwner(['business_type' => 'grocery_store']))
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.businessType', 'grocery_store')
            ->where('dashboard.focus', 'stock')
            ->where('dashboard.sections', ['lowStock', 'expiring', 'chart', 'topProducts', 'setup'])
            ->has('dashboard.stats', 4));
});

test('owner dashboard sections follow the stored clothing business type', function () {
    $this->actingAs(dashboardOwner(['business_type' => 'clothing_store']))
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.businessType', 'clothing_store')
            ->where('dashboard.focus', 'products')
            ->where('dashboard.sections', ['topProducts', 'chart', 'stagnant', 'lowStock', 'setup'])
            ->has('dashboard.stats', 4));
});

test('owner dashboard sections follow the stored electronics business type', function () {
    $this->actingAs(dashboardOwner(['business_type' => 'electronics']))
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.businessType', 'electronics')
            ->where('dashboard.focus', 'value')
            ->where('dashboard.sections', ['topSellingProduct', 'chart', 'lowStock', 'stagnant', 'setup'])
            ->has('dashboard.stats', 4));
});

test('value-group dashboard shows today\'s expense for the owner\'s business instead of stock value', function () {
    $owner = dashboardOwner(['business_type' => 'electronics']);
    $business = $owner->business;

    Expense::factory()->create(['business_id' => $business->id, 'amount' => 100.00, 'expense_date' => today()]);
    Expense::factory()->create(['business_id' => $business->id, 'amount' => 50.00, 'expense_date' => today()]);
    Expense::factory()->create(['business_id' => $business->id, 'amount' => 777.00, 'expense_date' => today()->subDay()]);

    $other = Business::factory()->create();
    Expense::factory()->create(['business_id' => $other->id, 'amount' => 999.00, 'expense_date' => today()]);

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.stats.1.key', 'expenses_today')
            ->where('dashboard.stats.1.label', "Today's expense")
            ->where('dashboard.stats.1.trend', 'Recorded costs')
            ->where('dashboard.stats.1.value', '150.00 ETB'));
});

test('value-group dashboard reports the top selling product from completed sales of the owner\'s business', function () {
    $owner = dashboardOwner(['business_type' => 'electronics']);
    $business = $owner->business;

    $productA = Product::factory()->forBusiness($business)->create(['name' => 'Buskut']);
    $productB = Product::factory()->forBusiness($business)->create(['name' => 'Shirt']);

    $completed = Sale::factory()->create(['business_id' => $business->id, 'status' => SaleStatus::Completed]);
    SaleItem::factory()->create(['sale_id' => $completed->id, 'product_id' => $productA->id, 'quantity' => 35, 'unit_price' => 20.02, 'line_total' => 700.70]);
    SaleItem::factory()->create(['sale_id' => $completed->id, 'product_id' => $productB->id, 'quantity' => 20, 'unit_price' => 10.00, 'line_total' => 200.00]);

    $second = Sale::factory()->create(['business_id' => $business->id, 'status' => SaleStatus::Completed]);
    SaleItem::factory()->create(['sale_id' => $second->id, 'product_id' => $productA->id, 'quantity' => 5, 'unit_price' => 20.02, 'line_total' => 100.10]);

    $draft = Sale::factory()->create(['business_id' => $business->id, 'status' => SaleStatus::Draft]);
    SaleItem::factory()->create(['sale_id' => $draft->id, 'product_id' => $productA->id, 'quantity' => 1000, 'unit_price' => 20.00, 'line_total' => 20000.00]);

    $other = Business::factory()->create();
    $productC = Product::factory()->forBusiness($other)->create(['name' => 'Other product']);
    $otherSale = Sale::factory()->create(['business_id' => $other->id, 'status' => SaleStatus::Completed]);
    SaleItem::factory()->create(['sale_id' => $otherSale->id, 'product_id' => $productC->id, 'quantity' => 9999, 'unit_price' => 1.00, 'line_total' => 9999.00]);

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.stats.3.key', 'products')
            ->where('dashboard.stats.3.label', 'Products')
            ->where('dashboard.stats.3.value', '2')
            ->where('dashboard.topSellingProduct.name', 'Buskut')
            ->where('dashboard.topSellingProduct.units_sold', 40)
            ->where('dashboard.topSellingProduct.revenue', 800.80)
            ->where('dashboard.topSellingProduct.category', $productA->category->name));
});

test('value-group dashboard shows an empty top selling product state without completed sales', function () {
    $owner = dashboardOwner(['business_type' => 'electronics']);
    Product::factory()->forBusiness($owner->business)->create(['name' => 'Buskut']);

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.stats.3.key', 'products')
            ->where('dashboard.stats.3.value', '1')
            ->where('dashboard.topSellingProduct', null));
});

test('catalog-group dashboard keeps the top selling product stat in the stat grid', function () {
    $this->actingAs(dashboardOwner(['business_type' => 'clothing_store']))
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.sections', ['topProducts', 'chart', 'stagnant', 'lowStock', 'setup'])
            ->where('dashboard.stats.0.key', 'top_selling_product')
            ->where('dashboard.stats.0.label', 'Top selling product')
            ->where('dashboard.stats.0.value', 'No sales yet')
            ->where('dashboard.topSellingProduct', null));
});

test('owner dashboard falls back to general sections for unknown business types', function () {
    $this->actingAs(dashboardOwner(['business_type' => 'Bakery']))
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.businessType', 'Bakery')
            ->where('dashboard.focus', 'general')
            ->where('dashboard.sections', ['chart', 'lowStock', 'stagnant', 'setup']));
});
