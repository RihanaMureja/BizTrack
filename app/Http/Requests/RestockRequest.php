<?php

namespace App\Http\Requests;

use App\Enums\BusinessPermissionKey;
use Illuminate\Foundation\Http\FormRequest;

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
            'received_at' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date', 'after_or_equal:received_at'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
