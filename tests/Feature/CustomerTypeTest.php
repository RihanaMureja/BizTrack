<?php

use App\Enums\CustomerType;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

function typedCustomerOwnerWithBusiness(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

test('customer type fields exist for migrated records', function () {
    expect(Schema::hasColumns('customers', [
        'customer_type',
        'display_name',
        'contact_person',
        'contact_person_phone',
    ]))->toBeTrue();
});

test('existing style customer payload is stored as individual without data loss', function () {
    [$owner, $business] = typedCustomerOwnerWithBusiness();

    $this->actingAs($owner)
        ->post(route('customers.store'), [
            'full_name' => 'Legacy Person',
            'phone' => '0911000000',
            'email' => 'legacy@example.test',
        ])
        ->assertRedirect();

    $customer = Customer::query()->where('business_id', $business->id)->firstOrFail();

    expect($customer->customer_type)->toBe(CustomerType::Individual)
        ->and($customer->display_name)->toBe('Legacy Person')
        ->and($customer->full_name)->toBe('Legacy Person');
});

test('company customer requires contact person', function () {
    [$owner] = typedCustomerOwnerWithBusiness();

    $this->actingAs($owner)
        ->post(route('customers.store'), [
            'customer_type' => CustomerType::Company->value,
            'display_name' => 'Blue Nile Trading',
        ])
        ->assertSessionHasErrors('contact_person');
});

test('government customer requires contact person', function () {
    [$owner] = typedCustomerOwnerWithBusiness();

    $this->actingAs($owner)
        ->post(route('customers.store'), [
            'customer_type' => CustomerType::Government->value,
            'display_name' => 'City Revenue Office',
        ])
        ->assertSessionHasErrors('contact_person');
});

test('company customer can be created with contact person details', function () {
    [$owner, $business] = typedCustomerOwnerWithBusiness();

    $this->actingAs($owner)
        ->post(route('customers.store'), [
            'customer_type' => CustomerType::Company->value,
            'display_name' => 'Blue Nile Trading',
            'contact_person' => 'Aster Bekele',
            'contact_person_phone' => '0911222333',
            'email' => 'company@example.test',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'business_id' => $business->id,
        'customer_type' => CustomerType::Company->value,
        'display_name' => 'Blue Nile Trading',
        'contact_person' => 'Aster Bekele',
    ]);
});
