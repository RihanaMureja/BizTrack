<?php

namespace App\Http\Requests;

use App\Enums\BusinessPermissionKey;
use App\Models\InventoryBatch;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class RestockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasBusinessPermission(BusinessPermissionKey::ManageInventory) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'unit_cost' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'selling_price' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'received_at' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date', 'after_or_equal:received_at'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $inventory = $this->route('inventory');
                $product = $inventory?->product;
                $unitCost = (float) $this->input('unit_cost');
                $sellingPrice = $this->input('selling_price');

                if (($sellingPrice === null || $sellingPrice === '') && $product) {
                    $sellingPrice = InventoryBatch::query()
                        ->where('product_id', $product->id)
                        ->where('business_id', $product->business_id)
                        ->latest('received_at')
                        ->latest('id')
                        ->value('selling_price');
                }

                if ($sellingPrice === null || $sellingPrice === '') {
                    $validator->errors()->add('selling_price', 'Selling price is required for the first restock.');

                    return;
                }

                if ((float) $sellingPrice < $unitCost) {
                    $validator->errors()->add('selling_price', 'Selling price must be greater than or equal to unit cost.');
                }
            },
        ];
    }
}
