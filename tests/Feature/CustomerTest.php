<?php

use App\Enums\Role;
use App\Models\Business;
use App\Models\Customer;
use App\Models\User;

function customerOwnerWithBusiness(): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $owner->forceFill(['business_id' => $business->id])->save();

    return [$owner, $business];
}

function cashierForBusiness(Business $business): User
{
    return User::factory()->create([
        'business_id' => $business->id,
        'role' => Role::Cashier,
    ]);
}

function validCustomerPayload(array $overrides = []): array
{
    return [
        'full_name' => 'Sara Customer',
        'phone' => '0911222333',
        'email' => 'sara.customer@biztrack.test',
        'address' => 'Addis Ababa',
        'credit_limit' => 5000,
        'current_balance' => 1000,
        ...$overrides,
    ];
}

test('guests are redirected to the login page', function () {
    $this->get(route('customers.index'))->assertRedirect(route('login'));
});

test('owner can view customer list', function () {
    [$owner, $business] = customerOwnerWithBusiness();
    Customer::factory()->count(2)->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->get(route('customers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('customers/index')
            ->where('customers.total', 2)
        );
});

test('cashier can view assigned business customers', function () {
    [$owner, $business] = customerOwnerWithBusiness();
    $cashier = cashierForBusiness($business);
    Customer::factory()->create(['business_id' => $business->id]);

    $this->actingAs($cashier)
        ->get(route('customers.index'))
        ->assertOk();
});

test('owner can create a customer', function () {
    [$owner, $business] = customerOwnerWithBusiness();

    $this->actingAs($owner)
        ->post(route('customers.store'), validCustomerPayload())
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'business_id' => $business->id,
        'email' => 'sara.customer@biztrack.test',
    ]);
});

test('cashier can create a customer for assigned business', function () {
    [$owner, $business] = customerOwnerWithBusiness();
    $cashier = cashierForBusiness($business);

    $this->actingAs($cashier)
        ->post(route('customers.store'), validCustomerPayload(['email' => 'cashier.customer@biztrack.test']))
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'business_id' => $business->id,
        'email' => 'cashier.customer@biztrack.test',
    ]);
});

test('customer email must be unique per business', function () {
    [$owner, $business] = customerOwnerWithBusiness();
    Customer::factory()->create(['business_id' => $business->id, 'email' => 'taken@biztrack.test']);

    $this->actingAs($owner)
        ->post(route('customers.store'), validCustomerPayload(['email' => 'taken@biztrack.test']))
        ->assertSessionHasErrors('email');
});

test('current balance cannot exceed credit limit', function () {
    [$owner] = customerOwnerWithBusiness();

    $this->actingAs($owner)
        ->post(route('customers.store'), validCustomerPayload([
            'credit_limit' => 100,
            'current_balance' => 200,
        ]))
        ->assertSessionHasErrors('current_balance');
});

test('owner can update their own customer', function () {
    [$owner, $business] = customerOwnerWithBusiness();
    $customer = Customer::factory()->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->put(route('customers.update', $customer), validCustomerPayload([
            'full_name' => 'Updated Customer',
            'email' => $customer->email,
        ]))
        ->assertRedirect();

    expect($customer->refresh()->full_name)->toBe('Updated Customer');
});

test('cashier cannot update another business customer', function () {
    [$owner, $business] = customerOwnerWithBusiness();
    $cashier = cashierForBusiness($business);
    $otherCustomer = Customer::factory()->create();

    $this->actingAs($cashier)
        ->put(route('customers.update', $otherCustomer), validCustomerPayload())
        ->assertForbidden();
});

test('owner can view customer profile', function () {
    [$owner, $business] = customerOwnerWithBusiness();
    $customer = Customer::factory()->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->get(route('customers.show', $customer))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('customers/show')
            ->where('customer.id', $customer->id)
            ->where('purchaseHistory', [])
        );
});

test('owner can search customers by phone', function () {
    [$owner, $business] = customerOwnerWithBusiness();
    Customer::factory()->create(['business_id' => $business->id, 'full_name' => 'Matching Customer', 'phone' => '0911444555']);
    Customer::factory()->create(['business_id' => $business->id, 'full_name' => 'Other Customer', 'phone' => '0922000000']);

    $this->actingAs($owner)
        ->get(route('customers.index', ['search' => '0911444555']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('customers/index')
            ->where('customers.data.0.full_name', 'Matching Customer')
            ->where('customers.total', 1)
        );
});

test('owner can delete their own customer', function () {
    [$owner, $business] = customerOwnerWithBusiness();
    $customer = Customer::factory()->create(['business_id' => $business->id]);

    $this->actingAs($owner)
        ->delete(route('customers.destroy', $customer))
        ->assertRedirect();

    $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
});
