<?php

use App\Enums\ExpenseSource;
use App\Enums\ExpenseStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Product;
use App\Models\User;

test('restocking inventory automatically records a linked expense', function () {
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $product = Product::factory()->create([
        'business_id' => $business->id,
        'category_id' => $category->id,
        'name' => 'Restocked Item',
    ]);

    $this->actingAs($owner)
        ->post(route('inventory.restock', $product->inventory), [
            'quantity' => 6,
            'unit_cost' => 25,
            'received_at' => today()->toDateString(),
            'notes' => 'Supplier delivery',
        ])
        ->assertRedirect();

    $batch = $product->inventoryBatches()->firstOrFail();
    $expense = Expense::query()->where('source', ExpenseSource::Restock)->firstOrFail();

    expect($expense->business_id)->toBe($business->id)
        ->and($expense->expense_category_id)->toBe(ExpenseCategory::query()->where('business_id', $business->id)->where('name', 'Inventory Restock')->value('id'))
        ->and($expense->source_reference_type)->toBe($batch::class)
        ->and($expense->source_reference_id)->toBe($batch->id)
        ->and((float) $expense->amount)->toBe(150.0)
        ->and($expense->status)->toBe(ExpenseStatus::Paid)
        ->and($expense->title)->toContain('Restocked Item');
});

test('expense ledger can filter by restock source', function () {
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();
    $manualCategory = ExpenseCategory::factory()->create(['business_id' => $business->id, 'name' => 'Manual']);
    $restockCategory = ExpenseCategory::factory()->create(['business_id' => $business->id, 'name' => 'Inventory Restock']);
    Expense::factory()->create(['business_id' => $business->id, 'expense_category_id' => $manualCategory->id, 'source' => ExpenseSource::Manual, 'amount' => 40]);
    Expense::factory()->create(['business_id' => $business->id, 'expense_category_id' => $restockCategory->id, 'source' => ExpenseSource::Restock, 'amount' => 90]);

    $this->actingAs($owner)
        ->get(route('expenses.index', ['source' => ExpenseSource::Restock->value]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('expenses/index')
            ->where('expenses.total', 1)
            ->where('total', '90.00')
        );
});
