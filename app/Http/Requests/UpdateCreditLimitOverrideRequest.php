<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCreditLimitOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === Role::Owner;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'credit_limit' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
        ];
    }
}
