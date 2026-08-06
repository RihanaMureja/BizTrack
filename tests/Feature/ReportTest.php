<?php

use App\Enums\ExpenseStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Product;
use App\Models\Report;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;

function reportBusinessContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('guests are redirected from reports', function () {
    $this->get(route('reports.index'))->assertRedirect(route('login'));
});

test('cashier cannot access reports', function () {
    [$owner, $business] = reportBusinessContext();
    $cashier = User::factory()->create(['role' => Role::Cashier, 'business_id' => $business->id]);

    $this->actingAs($cashier)->get(route('reports.index'))->assertForbidden();
});

test('owner can view profit report with real sales and expenses', function () {
    [$owner, $business] = reportBusinessContext();
    $expenseCategory = ExpenseCategory::factory()->create(['business_id' => $business->id]);
    Sale::factory()->create(['business_id' => $business->id, 'user_id' => $owner->id, 'grand_total' => 500, 'tax_amount' => 50, 'sold_at' => today()]);
    Expense::factory()->create(['business_id' => $business->id, 'expense_category_id' => $expenseCategory->id, 'user_id' => $owner->id, 'amount' => 125, 'expense_date' => today(), 'status' => ExpenseStatus::Approved]);

    $this->actingAs($owner)
        ->get(route('reports.index', ['type' => 'profit', 'date_from' => today()->toDateString(), 'date_to' => today()->toDateString()]))
        ->assertOk()
        ->assertInertia(fn($page) => $page
            ->component('reports/index')
            ->where('report.rawSummary.revenue', 500)
            ->where('report.rawSummary.expenses', 125)
            ->where('report.rawSummary.profit', 375));
});

test('owner can generate and store report metadata', function () {
    [$owner] = reportBusinessContext();

    $this->actingAs($owner)
        ->post(route('reports.store'), [
            'type' => 'sales',
            'date_from' => today()->subDay()->toDateString(),
            'date_to' => today()->toDateString(),
        ])
        ->assertRedirect(route('reports.index', [
            'type' => 'sales',
            'date_from' => today()->subDay()->toDateString(),
            'date_to' => today()->toDateString(),
        ]));

    $report = Report::query()->firstOrFail();
    expect($report->type)->toBe('sales')
        ->and($report->title)->toBe('Sales Report')
        ->and($report->summary)->toHaveKey('sales_count');
});

test('sales report includes top products', function () {
    [$owner, $business] = reportBusinessContext();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create(['business_id' => $business->id, 'category_id' => $category->id, 'name' => 'Best Item']);
    $sale = Sale::factory()->create(['business_id' => $business->id, 'user_id' => $owner->id, 'grand_total' => 120, 'sold_at' => today()]);
    SaleItem::factory()->create(['sale_id' => $sale->id, 'product_id' => $product->id, 'quantity' => 3, 'line_total' => 120]);

    $this->actingAs($owner)
        ->get(route('reports.index', ['type' => 'sales', 'date_from' => today()->toDateString(), 'date_to' => today()->toDateString()]))
        ->assertOk()
        ->assertInertia(fn($page) => $page
            ->where('report.rawSummary.sales_count', 1)
            ->where('report.topProducts.0.name', 'Best Item')
            ->where('report.topProducts.0.quantity', 3));
});

test('inventory report includes low stock and stock value', function () {
    [$owner, $business] = reportBusinessContext();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create(['business_id' => $business->id, 'category_id' => $category->id, 'buy_price' => 20, 'reorder_level' => 5]);
    $product->inventory->forceFill(['quantity' => 4, 'available_stock' => 4])->save();

    $this->actingAs($owner)
        ->get(route('reports.index', ['type' => 'inventory']))
        ->assertOk()
        ->assertInertia(fn($page) => $page
            ->where('report.rawSummary.products', 1)
            ->where('report.rawSummary.low_stock', 1)
            ->where('report.rawSummary.stock_value', 80));
});

test('products report summarizes sales by product and category', function () {
    [$owner, $business] = reportBusinessContext();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create(['business_id' => $business->id, 'category_id' => $category->id, 'name' => 'Best Item', 'buy_price' => 20]);
    $sale = Sale::factory()->create(['business_id' => $business->id, 'user_id' => $owner->id, 'grand_total' => 120, 'sold_at' => today()]);
    SaleItem::factory()->create(['sale_id' => $sale->id, 'product_id' => $product->id, 'quantity' => 3, 'line_total' => 120]);

    $this->actingAs($owner)
        ->get(route('reports.index', ['type' => 'products', 'date_from' => today()->toDateString(), 'date_to' => today()->toDateString()]))
        ->assertOk()
        ->assertInertia(fn($page) => $page
            ->where('report.rawSummary.products_sold', 1)
            ->where('report.rows.0.category', $category->name)
            ->where('report.rows.0.product_name', 'Best Item'));

    $this->actingAs($owner)
        ->get(route('reports.index', ['type' => 'products', 'product_id' => $product->id, 'date_from' => today()->toDateString(), 'date_to' => today()->toDateString()]))
        ->assertOk()
        ->assertInertia(fn($page) => $page->where('report.product.name', 'Best Item'));
});

test('tax report summarizes tax collected', function () {
    [$owner, $business] = reportBusinessContext();
    Sale::factory()->create(['business_id' => $business->id, 'user_id' => $owner->id, 'subtotal' => 200, 'tax_amount' => 30, 'grand_total' => 230, 'sold_at' => today()]);

    $this->actingAs($owner)
        ->get(route('reports.index', ['type' => 'tax', 'date_from' => today()->toDateString(), 'date_to' => today()->toDateString()]))
        ->assertOk()
        ->assertInertia(fn($page) => $page
            ->where('report.rawSummary.tax_collected', 30)
            ->where('report.rawSummary.taxable_sales', 200));
});

test('report validation requires valid date range', function () {
    [$owner] = reportBusinessContext();

    $this->actingAs($owner)
        ->post(route('reports.store'), [
            'type' => 'sales',
            'date_from' => today()->toDateString(),
            'date_to' => today()->subDay()->toDateString(),
        ])
        ->assertSessionHasErrors('date_to');
});
