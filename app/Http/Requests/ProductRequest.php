<?php

namespace App\Http\Requests;

use App\Enums\BusinessPermissionKey;
use App\Enums\RecordStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasBusinessPermission(BusinessPermissionKey::ManageProducts) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $businessId = $this->user()?->ownedBusiness?->id ?? $this->user()?->business_id;
        $product = $this->route('product');

        return [
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')
                    ->where(fn ($query) => $query->where('business_id', $businessId)),
            ],
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('products', 'name')
                    ->where(fn ($query) => $query
                        ->where('business_id', $businessId)
                        ->where('category_id', $this->input('category_id')))
                    ->ignore($product),
            ],
            'barcode' => ['prohibited'],
            'qr_payload' => ['prohibited'],
            'description' => ['nullable', 'string', 'max:1000'],
            'buy_price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'selling_price' => ['required', 'numeric', 'min:0', 'max:99999999.99', 'gte:buy_price'],
            'unit' => ['nullable', 'string', 'max:30'],
            'reorder_level' => ['required', 'integer', 'min:0', 'max:1000000'],
            'status' => ['required', Rule::enum(RecordStatus::class)],
        ];
    }
}
