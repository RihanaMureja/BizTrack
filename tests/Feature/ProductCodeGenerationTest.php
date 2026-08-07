<?php

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;

function phase28ProductOwnerContext(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function phase28ValidProductPayload(array $overrides = []): array
{
    return [
        'category_id' => null,
        'name' => 'Phase 28 Product',
        'description' => 'Generated code product',
        'buy_price' => 10,
        'selling_price' => 15,
        'unit' => 'pcs',
        'reorder_level' => 3,
        'status' => RecordStatus::Active->value,
        ...$overrides,
    ];
}

test('product barcode and qr payload are generated on creation', function () {
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'business_name' => 'Merkato Fresh',
        'status' => RecordStatus::Active,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    $this->actingAs($owner)
        ->post(route('products.store'), [
            'name' => 'Generated Code Product',
            'buy_price' => 10,
            'selling_price' => 15,
            'unit' => 'pcs',
            'reorder_level' => 3,
            'status' => RecordStatus::Active->value,
        ])
        ->assertRedirect();

    $product = Product::query()->where('name', 'Generated Code Product')->firstOrFail();

    expect($product->barcode)->toStartWith('MERK')
        ->and($product->qr_payload)->toContain('biztrack.product')
        ->and($product->qr_payload)->toContain($product->barcode);
});

test('manual barcode and qr payload submission is rejected', function () {
    [$owner] = phase28ProductOwnerContext();

    $this->actingAs($owner)
        ->post(route('products.store'), [
            ...phase28ValidProductPayload(),
            'barcode' => 'MANUAL001',
            'qr_payload' => 'manual-qr',
        ])
        ->assertSessionHasErrors(['barcode', 'qr_payload']);
});

test('printable product label is available', function () {
    [$owner, $business] = phase28ProductOwnerContext();
    $product = Product::factory()->create([
        'business_id' => $business->id,
        'barcode' => 'PRINT001',
        'qr_payload' => '{"type":"biztrack.product","barcode":"PRINT001"}',
    ]);

    $this->actingAs($owner)
        ->get(route('products.label', $product))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/label')
            ->where('product.id', $product->id)
            ->where('product.barcode', 'PRINT001'));
});

test('sold product barcode cannot be changed through product update', function () {
    [$owner, $business] = phase28ProductOwnerContext();
    $product = Product::factory()->create(['business_id' => $business->id, 'barcode' => 'SOLD001']);
    $sale = Sale::factory()->create(['business_id' => $business->id, 'user_id' => $owner->id]);
    SaleItem::factory()->create(['sale_id' => $sale->id, 'product_id' => $product->id]);

    $this->actingAs($owner)
        ->put(route('products.update', $product), [
            ...phase28ValidProductPayload(['name' => 'Sold Product']),
            'barcode' => 'SOLD002',
        ])
        ->assertSessionHasErrors('barcode');

    expect($product->refresh()->barcode)->toBe('SOLD001');
});
