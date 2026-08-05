<?php

use App\Enums\Role;
use App\Enums\SaleStatus;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use App\Events\SaleCompleted;
use App\Events\InventoryLow;

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

test('owner can create a sale directly', function () {
    Event::fake([SaleCompleted::class]);
    [$owner, $business] = saleBusinessContext();
    $product = stockedProduct($business, 10, 25);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'items' => [['product_id' => $product->id, 'quantity' => 3]],
        ])
        ->assertRedirect(route('sales.index'));

    $sale = Sale::query()->firstOrFail();
    expect((float) $sale->subtotal)->toBe(75.0)
        ->and((float) $sale->grand_total)->toBe(75.0)
        ->and($sale->user_id)->toBe($owner->id)
        ->and($product->inventory->refresh()->available_stock)->toBe(7);

    Event::assertDispatched(SaleCompleted::class);
});

test('user with no business cannot create a sale', function () {
    $user = User::factory()->create(['role' => Role::Cashier, 'business_id' => null]);
    $product = Product::factory()->create();

    $this->actingAs($user)
        ->post(route('sales.store'), [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertForbidden();

    expect(Sale::query()->count())->toBe(0);
});

test('sale totals are summed correctly across multiple items', function () {
    [$owner, $business] = saleBusinessContext();
    $productA = stockedProduct($business, 10, 20);
    $productB = stockedProduct($business, 5, 15);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'tax_amount' => 4,
            'discount_amount' => 9,
            'items' => [
                ['product_id' => $productA->id, 'quantity' => 2],
                ['product_id' => $productB->id, 'quantity' => 3],
            ],
        ])
        ->assertRedirect(route('sales.index'));

    $sale = Sale::query()->firstOrFail();
    // (2 * 20) + (3 * 15) = 85 subtotal, +4 tax -9 discount = 80 grand total
    expect((float) $sale->subtotal)->toBe(85.0)
        ->and((float) $sale->grand_total)->toBe(80.0)
        ->and($sale->items()->count())->toBe(2)
        ->and($productA->inventory->refresh()->available_stock)->toBe(8)
        ->and($productB->inventory->refresh()->available_stock)->toBe(2);
});

test('sale that drops stock to reorder level dispatches low stock event and notifies owner', function () {
    Event::fake([InventoryLow::class]);
    [$owner, $business] = saleBusinessContext();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $category->id,
        'selling_price' => 10,
        'reorder_level' => 5,
    ]);
    $product->inventory->forceFill(['quantity' => 8, 'available_stock' => 8])->save();
    $product->refresh();

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'items' => [['product_id' => $product->id, 'quantity' => 3]],
        ])
        ->assertRedirect(route('sales.index'));

    expect($product->inventory->refresh()->available_stock)->toBe(5);
    Event::assertDispatched(InventoryLow::class, fn (InventoryLow $event) => $event->inventory->product_id === $product->id);
});

test('low stock event from a sale creates an in app notification for the owner', function () {
    [$owner, $business] = saleBusinessContext();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $category->id,
        'selling_price' => 10,
        'reorder_level' => 5,
    ]);
    $product->inventory->forceFill(['quantity' => 6, 'available_stock' => 6])->save();
    $product->refresh();

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])
        ->assertRedirect(route('sales.index'));

    expect(Notification::query()->where('type', 'low_stock')->where('business_id', $business->id)->exists())->toBeTrue();
});

test('completing a sale writes an audit log entry', function () {
    [$owner, $business] = saleBusinessContext();
    $product = stockedProduct($business, 10, 25);

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertRedirect(route('sales.index'));

    $sale = Sale::query()->firstOrFail();

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $owner->id,
        'action' => 'sale_completed',
        'table_name' => 'sales',
        'record_id' => $sale->id,
    ]);

    $log = AuditLog::query()->where('record_id', $sale->id)->where('action', 'sale_completed')->firstOrFail();
    expect($log->new_values['invoice_number'])->toBe($sale->invoice_number);
});

test('cashier from another business cannot view a sale', function () {
    [$owner, $business] = saleBusinessContext();
    $sale = Sale::factory()->create(['business_id' => $business->id, 'user_id' => $owner->id]);

    [, $otherBusiness] = saleBusinessContext();
    $otherCashier = User::factory()->create(['business_id' => $otherBusiness->id, 'role' => Role::Cashier]);

    $this->actingAs($otherCashier)
        ->get(route('sales.show', $sale))
        ->assertForbidden();
});

test('checkout creates a completed cash payment and records customer credit', function () {
    [$owner, $business] = saleBusinessContext();
    $customer = Customer::factory()->create(['business_id' => $business->id]);
    $product = stockedProduct($business, 4, 25);

    $this->actingAs($owner)
        ->post(route('sales.checkout'), [
            'customer_id' => $customer->id,
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
            'payment_method' => 'cash',
            'amount_received' => 30,
            'enable_credit' => true,
        ])
        ->assertRedirect();

    $sale = Sale::query()->sole();
    expect((float) $sale->paid_amount)->toBe(30.0)
        ->and((float) $sale->balance_due)->toBe(20.0)
        ->and($product->inventory->refresh()->available_stock)->toBe(2);
    $this->assertDatabaseHas('payments', ['sale_id' => $sale->id, 'amount' => 30]);
    $this->assertDatabaseHas('customer_credits', ['sale_id' => $sale->id, 'remaining_balance' => 20]);
    expect(Payment::query()->count())->toBe(1)->and(CustomerCredit::query()->count())->toBe(1);
});

test('checkout rejects an unpaid walk-in sale without creating partial records', function () {
    [$owner, $business] = saleBusinessContext();
    $product = stockedProduct($business, 3, 25);

    $this->actingAs($owner)
        ->from(route('sales.checkout.page'))
        ->post(route('sales.checkout'), [
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
            'payment_method' => 'cash',
            'amount_received' => 10,
            'enable_credit' => false,
        ])
        ->assertRedirect(route('sales.checkout.page'))
        ->assertSessionHasErrors('amount_received');

    expect(Sale::query()->count())->toBe(0)
        ->and(Payment::query()->count())->toBe(0)
        ->and($product->inventory->refresh()->available_stock)->toBe(3);
});
