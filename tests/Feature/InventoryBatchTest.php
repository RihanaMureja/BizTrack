<?php

use App\Enums\InventoryTransactionType;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\User;

test('every restock creates an inventory batch with cost and optional expiry', function () {
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create(['business_id' => $business->id, 'category_id' => $category->id]);

    $this->actingAs($owner)
        ->post(route('inventory.restock', $product->inventory), [
            'quantity' => 25,
            'unit_cost' => 42.75,
            'expiry_date' => now()->addMonths(8)->toDateString(),
            'notes' => 'Supplier delivery',
        ])
        ->assertRedirect();

    $batch = InventoryBatch::query()->firstOrFail();

    expect($batch->quantity_received)->toBe(25)
        ->and($batch->quantity_remaining)->toBe(25)
        ->and((float) $batch->unit_cost)->toBe(42.75)
        ->and($product->inventory->refresh()->available_stock)->toBe(25);

    $this->assertDatabaseHas('inventory_transactions', [
        'inventory_batch_id' => $batch->id,
        'type' => InventoryTransactionType::Restock->value,
        'quantity_change' => 25,
    ]);
});
