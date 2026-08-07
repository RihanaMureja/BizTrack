<?php

use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\User;

test('sales consume inventory batches fifo oldest first', function () {
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $category->id,
        'selling_price' => 20,
    ]);

    $oldBatch = InventoryBatch::factory()->create([
        'product_id' => $product->id,
        'business_id' => $business->id,
        'quantity_received' => 5,
        'quantity_remaining' => 5,
        'unit_cost' => 8,
        'received_at' => now()->subDays(10),
    ]);
    $newBatch = InventoryBatch::factory()->create([
        'product_id' => $product->id,
        'business_id' => $business->id,
        'quantity_received' => 10,
        'quantity_remaining' => 10,
        'unit_cost' => 9,
        'received_at' => now()->subDay(),
    ]);
    $product->inventory->forceFill(['quantity' => 15, 'available_stock' => 15])->save();

    $this->actingAs($owner)
        ->post(route('sales.store'), [
            'items' => [['product_id' => $product->id, 'quantity' => 8]],
        ])
        ->assertRedirect(route('sales.index'));

    expect($oldBatch->refresh()->quantity_remaining)->toBe(0)
        ->and($newBatch->refresh()->quantity_remaining)->toBe(7)
        ->and($product->inventory->refresh()->available_stock)->toBe(7);

    $this->assertDatabaseHas('inventory_transactions', [
        'inventory_batch_id' => $oldBatch->id,
        'quantity_change' => -5,
    ]);
    $this->assertDatabaseHas('inventory_transactions', [
        'inventory_batch_id' => $newBatch->id,
        'quantity_change' => -3,
    ]);
});
