<?php

use App\Enums\Role;
use App\Models\Business;
use App\Models\Category;
use App\Models\User;

function ownerWithBusiness(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('guests are redirected to the login page', function () {
    $response = $this->get(route('categories.index'));
    $response->assertRedirect(route('login'));
});

test('cashiers cannot manage categories', function () {
    $cashier = User::factory()->create(['role' => Role::Cashier]);

    $this->actingAs($cashier)
        ->get(route('categories.index'))
        ->assertForbidden();
});

test('owner can view their categories list', function () {
    [$owner, $business] = ownerWithBusiness();
    Category::factory()->count(3)->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->get(route('categories.index'))
        ->assertOk();
});

test('owner can create a category', function () {
    [$owner] = ownerWithBusiness();

    $this->actingAs($owner)
        ->post(route('categories.store'), [
            'name' => 'Beverages',
            'description' => 'Cold and hot drinks',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('categories', ['name' => 'Beverages']);
});

test('category name must be unique per business', function () {
    [$owner, $business] = ownerWithBusiness();
    Category::factory()->create(['business_id' => $business->id, 'name' => 'Beverages']);

    $this->actingAs($owner)
        ->post(route('categories.store'), ['name' => 'Beverages'])
        ->assertSessionHasErrors('name');
});

test('owner can update their own category', function () {
    [$owner, $business] = ownerWithBusiness();
    $category = Category::factory()->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->put(route('categories.update', $category), ['name' => 'Renamed'])
        ->assertRedirect();

    expect($category->refresh()->name)->toBe('Renamed');
});

test('owner cannot update another business category', function () {
    [$owner] = ownerWithBusiness();
    $otherCategory = Category::factory()->create();

    $this->actingAs($owner)
        ->put(route('categories.update', $otherCategory), ['name' => 'Hijacked'])
        ->assertForbidden();
});

test('owner can delete an empty category', function () {
    [$owner, $business] = ownerWithBusiness();
    $category = Category::factory()->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->delete(route('categories.destroy', $category))
        ->assertRedirect();

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('owner cannot delete a category that has products', function () {
    [$owner, $business] = ownerWithBusiness();
    $category = Category::factory()->create(['business_id' => $business->id]);
    $category->products()->create([
        'business_id' => $business->id,
        'name' => 'Sample product',
        'buy_price' => 10,
        'selling_price' => 15,
    ]);

    $this->actingAs($owner)
        ->delete(route('categories.destroy', $category))
        ->assertSessionHasErrors('category');

    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});
