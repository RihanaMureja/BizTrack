<?php

namespace App\Http\Requests;

use App\Enums\BusinessPermissionKey;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasBusinessPermission(BusinessPermissionKey::ManageExpenses) ?? false;
    }

    public function rules(): array
    {
        $businessId = $this->user()?->ownedBusiness?->id ?? $this->user()?->business_id;

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('expense_categories', 'name')
                    ->where(fn ($query) => $query->where('business_id', $businessId))
                    ->ignore($this->route('expense_category')),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
