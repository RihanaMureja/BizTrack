<?php

namespace App\Http\Requests;

use App\Enums\ExpenseStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() ?? false;
    }

    public function rules(): array
    {
        $business = $this->user()?->ownedBusiness;

        return [
            'expense_category_id' => ['required', 'integer', Rule::exists('expense_categories', 'id')->where(fn ($query) => $query->where('business_id', $business?->id))],
            'title' => ['required', 'string', 'max:160'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'expense_date' => ['required', 'date'],
            'status' => ['required', Rule::enum(ExpenseStatus::class)],
            'vendor' => ['nullable', 'string', 'max:160'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,webp', 'max:4096'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
