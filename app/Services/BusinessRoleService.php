<?php

namespace App\Services;

use App\Enums\BusinessPermissionKey;
use App\Models\Business;
use App\Models\BusinessPermission;
use App\Models\BusinessRole;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BusinessRoleService
{
    public function paginateForBusiness(Business $business, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return BusinessRole::query()
            ->with('permissions:id,key,name,group')
            ->withCount(['users', 'permissions'])
            ->where('business_id', $business->id)
            ->when($search, fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Business $business, array $data): BusinessRole
    {
        $role = $business->roles()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_default' => (bool) ($data['is_default'] ?? false),
        ]);

        $this->syncPermissions($role, $data['permission_ids'] ?? []);

        if ($role->is_default) {
            $this->markOnlyDefault($role);
        }

        return $role->load('permissions');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(BusinessRole $role, array $data): BusinessRole
    {
        $role->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_default' => (bool) ($data['is_default'] ?? false),
        ]);

        $this->syncPermissions($role, $data['permission_ids'] ?? []);

        if ($role->is_default) {
            $this->markOnlyDefault($role);
        }

        return $role->refresh()->load('permissions');
    }

    public function defaultRoleFor(Business $business): BusinessRole
    {
        $default = $business->roles()->where('is_default', true)->first();

        if ($default) {
            return $default;
        }

        $role = $business->roles()->create([
            'name' => 'Cashier',
            'description' => 'Default POS employee role.',
            'is_default' => true,
        ]);

        $role->permissions()->sync(
            BusinessPermission::query()
                ->whereIn('key', [
                    BusinessPermissionKey::ViewDashboard->value,
                    BusinessPermissionKey::ManageCustomers->value,
                    BusinessPermissionKey::CreateSales->value,
                    BusinessPermissionKey::ViewSales->value,
                    BusinessPermissionKey::ManagePayments->value,
                    BusinessPermissionKey::ViewNotifications->value,
                ])
                ->pluck('id')
                ->all(),
        );

        return $role->load('permissions');
    }

    /**
     * @param  array<int, int|string>  $permissionIds
     */
    private function syncPermissions(BusinessRole $role, array $permissionIds): void
    {
        $role->permissions()->sync(
            BusinessPermission::query()
                ->whereIn('id', $permissionIds)
                ->pluck('id')
                ->all(),
        );
    }

    private function markOnlyDefault(BusinessRole $role): void
    {
        BusinessRole::query()
            ->where('business_id', $role->business_id)
            ->whereKeyNot($role->id)
            ->update(['is_default' => false]);
    }
}
