<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() ?? false;
    }

    public function rules(): array
    {
        $business = $this->user()?->ownedBusiness;

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('expense_categories', 'name')
                    ->where(fn ($query) => $query->where('business_id', $business?->id))
                    ->ignore($this->route('expense_category')),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
