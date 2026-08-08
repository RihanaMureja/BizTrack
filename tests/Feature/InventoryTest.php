<?php

use App\Enums\InventoryTransactionType;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Events\InventoryLow;
use App\Models\Business;
use App\Models\BusinessPermission;
use App\Models\BusinessRole;
use App\Models\Category;
use App\Models\InventoryBatch;
use App\Models\Notification;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Event;

function inventoryOwnerWithBusiness(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function productWithInventory(Business $business, array $overrides = []): Product
{
    $category = Category::factory()->create(['business_id' => $business->id]);

    return Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $category->id,
        'reorder_level' => 5,
        'status' => RecordStatus::Active,
        ...$overrides,
    ]);
}

test('guests are redirected to the login page', function () {
    $this->get(route('inventory.index'))->assertRedirect(route('login'));
});

test('cashiers cannot manage inventory', function () {
    $cashier = User::factory()->create(['role' => Role::Cashier]);

    $this->actingAs($cashier)
        ->get(route('inventory.index'))
        ->assertForbidden();
});

test('employee with inventory permission can view inventory list', function () {
    [, $business] = inventoryOwnerWithBusiness();
    $permission = BusinessPermission::query()->firstOrCreate([
        'key' => 'manage_inventory',
    ], [
        'name' => 'Manage Inventory',
        'group' => 'Inventory',
    ]);
    $role = BusinessRole::factory()->create([
        'business_id' => $business->id,
        'name' => 'Inventory Manager',
    ]);
    $role->permissions()->sync([$permission->id]);
    $employee = User::factory()->create([
        'role' => Role::Cashier,
        'business_id' => $business->id,
        'business_role_id' => $role->id,
    ]);
    productWithInventory($business);

    $this->actingAs($employee)
        ->get(route('inventory.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('inventory/index')
            ->where('inventory.total', 1)
        );
});

test('employee with inventory permission can restock own business inventory only', function () {
    [, $business] = inventoryOwnerWithBusiness();
    $permission = BusinessPermission::query()->firstOrCreate([
        'key' => 'manage_inventory',
    ], [
        'name' => 'Manage Inventory',
        'group' => 'Inventory',
    ]);
    $role = BusinessRole::factory()->create([
        'business_id' => $business->id,
        'name' => 'Inventory Manager',
    ]);
    $role->permissions()->sync([$permission->id]);
    $employee = User::factory()->create([
        'role' => Role::Cashier,
        'business_id' => $business->id,
        'business_role_id' => $role->id,
    ]);
    $product = productWithInventory($business);
    $otherProduct = Product::factory()->create();

    $this->actingAs($employee)
        ->post(route('inventory.restock', $product->inventory), [
            'quantity' => 8,
            'notes' => 'Shelf count',
        ])
        ->assertRedirect();

    expect($product->inventory->refresh()->available_stock)->toBe(8);

    $this->actingAs($employee)
        ->post(route('inventory.restock', $otherProduct->inventory), [
            'quantity' => 8,
        ])
        ->assertForbidden();
});

test('owner can view inventory list', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    productWithInventory($business);

    $this->actingAs($owner)
        ->get(route('inventory.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('inventory/index')
            ->where('inventory.total', 1)
        );
});

test('owner can restock product inventory', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), [
            'quantity' => 12,
            'notes' => 'Opening stock',
        ])
        ->assertRedirect();

    $inventory->refresh();

    expect($inventory->available_stock)->toBe(12)
        ->and($inventory->transactions()->first()->type)->toBe(InventoryTransactionType::Restock);
});

test('restock creates a batch with an auto-generated unique batch number and restock date', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), ['quantity' => 12])
        ->assertRedirect();

    $batch = $inventory->batches()->first();

    expect($batch)->not->toBeNull()
        ->and($batch->batch_number)->toMatch('/^BATCH-\d{8}-\d{3}$/')
        ->and($batch->quantity)->toBe(12)
        ->and($batch->remaining_quantity)->toBe(12)
        ->and($batch->received_at)->not->toBeNull();
});

test('multiple restocks create separate batches with sequential unique batch numbers', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), ['quantity' => 10])
        ->assertRedirect();
    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), ['quantity' => 20])
        ->assertRedirect();

    $batches = $inventory->batches()->orderBy('id')->get();

    expect($batches)->toHaveCount(2)
        ->and($batches->pluck('batch_number')->unique())->toHaveCount(2)
        ->and($batches[0]->batch_number)->toMatch('/^BATCH-\d{8}-001$/')
        ->and($batches[1]->batch_number)->toMatch('/^BATCH-\d{8}-002$/')
        ->and($batches[0]->quantity)->toBe(10)
        ->and($batches[1]->quantity)->toBe(20)
        ->and($inventory->refresh()->available_stock)->toBe(30);
});

test('restock falls back to the product buy price as the default unit cost', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business, ['buy_price' => 45.5]);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), ['quantity' => 5])
        ->assertRedirect();

    expect((float) $inventory->batches()->first()->unit_cost)->toBe(45.5);
});

test('restock uses the provided unit cost for the batch', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business, ['buy_price' => 45.5]);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), ['quantity' => 5, 'unit_cost' => 22.75])
        ->assertRedirect();

    expect((float) $inventory->batches()->first()->unit_cost)->toBe(22.75);
});

test('restock stores the provided expiry date on the batch', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), [
            'quantity' => 5,
            'expiry_date' => now()->addYear()->format('Y-m-d'),
        ])
        ->assertRedirect();

    expect($inventory->batches()->first()->expires_at?->format('Y-m-d'))
        ->toBe(now()->addYear()->format('Y-m-d'));
});

test('expiry date earlier than the restock date is rejected', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), [
            'quantity' => 5,
            'expiry_date' => now()->subDay()->format('Y-m-d'),
        ])
        ->assertSessionHasErrors('expiry_date');

    expect($inventory->refresh()->available_stock)->toBe(0)
        ->and($inventory->batches()->count())->toBe(0);
});

test('batches page exposes batch number and expiry date', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), [
            'quantity' => 5,
            'expiry_date' => now()->addYear()->format('Y-m-d'),
        ])
        ->assertRedirect();

    $this->actingAs($owner)
        ->get(route('inventory.batches.index', $inventory))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('inventory/batches')
            ->where('batches.total', 1)
            ->where('batches.data.0.batch_number', $inventory->batches()->first()->batch_number)
            ->where('batches.data.0.expires_at', $inventory->batches()->first()->expires_at->toJSON())
        );
});

test('inventory batch numbers are unique across batches', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), ['quantity' => 3])
        ->assertRedirect();

    $batch = $inventory->batches()->first();

    expect(InventoryBatch::query()->where('batch_number', $batch->batch_number)->count())->toBe(1);
});

test('owner can manually adjust stock to a target quantity', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;
    $inventory->forceFill(['quantity' => 20, 'available_stock' => 20])->save();

    $this->actingAs($owner)
        ->post(route('inventory.adjust', $inventory), [
            'type' => InventoryTransactionType::Adjustment->value,
            'quantity' => 7,
            'notes' => 'Cycle count',
        ])
        ->assertRedirect();

    expect($inventory->refresh()->available_stock)->toBe(7)
        ->and($inventory->transactions()->first()->quantity_change)->toBe(-13);
});

test('damaged stock reduces inventory and cannot go below zero', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;
    $inventory->forceFill(['quantity' => 3, 'available_stock' => 3])->save();

    $this->actingAs($owner)
        ->post(route('inventory.adjust', $inventory), [
            'type' => InventoryTransactionType::Damaged->value,
            'quantity' => 4,
        ])
        ->assertSessionHasErrors('quantity');

    expect($inventory->refresh()->available_stock)->toBe(3);
});

test('returned stock increases inventory', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.adjust', $inventory), [
            'type' => InventoryTransactionType::Return->value,
            'quantity' => 2,
        ])
        ->assertRedirect();

    expect($inventory->refresh()->available_stock)->toBe(2)
        ->and($inventory->transactions()->first()->type)->toBe(InventoryTransactionType::Return);
});

test('owner cannot adjust another business inventory', function () {
    [$owner] = inventoryOwnerWithBusiness();
    $otherProduct = Product::factory()->create();

    $this->actingAs($owner)
        ->post(route('inventory.restock', $otherProduct->inventory), ['quantity' => 5])
        ->assertForbidden();
});

test('low stock event is dispatched when stock reaches reorder level', function () {
    Event::fake([InventoryLow::class]);
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business, ['reorder_level' => 10]);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), ['quantity' => 5])
        ->assertRedirect();

    Event::assertDispatched(InventoryLow::class);
});

test('inventory history page shows transaction records', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business);
    $inventory = $product->inventory;

    $this->actingAs($owner)
        ->post(route('inventory.restock', $inventory), ['quantity' => 5])
        ->assertRedirect();

    $this->actingAs($owner)
        ->get(route('inventory.transactions.index', $inventory))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('inventory/history')
            ->where('transactions.total', 1)
        );
});

test('low stock listener creates an in app notification', function () {
    [$owner, $business] = inventoryOwnerWithBusiness();
    $product = productWithInventory($business, ['reorder_level' => 10]);
    $inventory = $product->inventory;

    InventoryLow::dispatch($inventory);

    expect(Notification::query()->where('type', 'low_stock')->exists())->toBeTrue();
});
