<?php

use App\Enums\BusinessPermissionKey;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\BusinessPermission;
use App\Models\BusinessRole;
use App\Models\Category;
use App\Models\ExpenseCategory;
use App\Models\Product;
use App\Models\User;

function employeeWithBusinessPermission(BusinessPermissionKey $permissionKey): array
{
    $owner = User::factory()->create(['role' => Role::Owner]);
    $business = Business::factory()->create([
        'owner_id' => $owner->id,
        'status' => RecordStatus::Active,
    ]);
    $owner->forceFill(['business_id' => $business->id])->save();

    $permission = BusinessPermission::query()->firstOrCreate([
        'key' => $permissionKey->value,
    ], [
        'name' => $permissionKey->label(),
        'group' => $permissionKey->group(),
    ]);

    $role = BusinessRole::factory()->create([
        'business_id' => $business->id,
        'name' => $permissionKey->label().' Role',
    ]);
    $role->permissions()->sync([$permission->id]);

    $employee = User::factory()->create([
        'role' => Role::Cashier,
        'business_id' => $business->id,
        'business_role_id' => $role->id,
        'status' => RecordStatus::Active,
    ]);

    return [$employee, $business];
}

test('employee with category permission can open categories', function () {
    [$employee, $business] = employeeWithBusinessPermission(BusinessPermissionKey::ManageCategories);
    Category::factory()->create(['business_id' => $business->id]);

    $this->actingAs($employee)
        ->get(route('categories.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('categories/index'));
});

test('employee with product permission can open products', function () {
    [$employee, $business] = employeeWithBusinessPermission(BusinessPermissionKey::ManageProducts);
    $category = Category::factory()->create(['business_id' => $business->id]);
    Product::factory()->create(['business_id' => $business->id, 'category_id' => $category->id]);

    $this->actingAs($employee)
        ->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('products/index'));
});

test('employee with inventory permission can open inventory', function () {
    [$employee, $business] = employeeWithBusinessPermission(BusinessPermissionKey::ManageInventory);
    $category = Category::factory()->create(['business_id' => $business->id]);
    Product::factory()->create(['business_id' => $business->id, 'category_id' => $category->id]);

    $this->actingAs($employee)
        ->get(route('inventory.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('inventory/index'));
});

test('employee with a module permission can open dashboard without dashboard permission', function () {
    [$employee] = employeeWithBusinessPermission(BusinessPermissionKey::ManageInventory);

    $this->actingAs($employee)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboard.role', Role::Cashier->value)
            ->where('dashboard.stats', [])
        );
});

test('employee with customer permission can open customers', function () {
    [$employee] = employeeWithBusinessPermission(BusinessPermissionKey::ManageCustomers);

    $this->actingAs($employee)
        ->get(route('customers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('customers/index'));
});

test('employee with sales permission can open sales list', function () {
    [$employee] = employeeWithBusinessPermission(BusinessPermissionKey::ViewSales);

    $this->actingAs($employee)
        ->get(route('sales.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('sales/index'));
});

test('employee with payment permission can open payments', function () {
    [$employee] = employeeWithBusinessPermission(BusinessPermissionKey::ManagePayments);

    $this->actingAs($employee)
        ->get(route('payments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('payments/index'));
});

test('employee with expense permission can open expenses', function () {
    [$employee, $business] = employeeWithBusinessPermission(BusinessPermissionKey::ManageExpenses);
    ExpenseCategory::factory()->create(['business_id' => $business->id]);

    $this->actingAs($employee)
        ->get(route('expenses.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('expenses/index'));
});

test('employee with report permission can open reports', function () {
    [$employee] = employeeWithBusinessPermission(BusinessPermissionKey::ViewReports);

    $this->actingAs($employee)
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('reports/index'));
});

test('employee with employee management permission can open employees and employee roles', function () {
    [$employee] = employeeWithBusinessPermission(BusinessPermissionKey::ManageEmployees);

    $this->actingAs($employee)
        ->get(route('cashiers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('cashiers/index'));

    $this->actingAs($employee)
        ->get(route('business-roles.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('roles/index'));
});
