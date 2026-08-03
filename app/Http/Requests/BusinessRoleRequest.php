<?php

namespace App\Http\Requests;

use App\Enums\BusinessPermissionKey;
use App\Models\BusinessRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BusinessRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasBusinessPermission(BusinessPermissionKey::ManageEmployees) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $businessId = $this->user()?->ownedBusiness?->id ?? $this->user()?->business_id;
        $role = $this->route('businessRole');

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('business_roles', 'name')
                    ->where('business_id', $businessId)
                    ->ignore($role instanceof BusinessRole ? $role->id : null),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_default' => ['boolean'],
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', Rule::exists('business_permissions', 'id')],
        ];
    }
}
