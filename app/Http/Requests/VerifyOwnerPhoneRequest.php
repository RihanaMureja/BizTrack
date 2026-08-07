<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class VerifyOwnerPhoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === Role::Owner;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'max:30'],
            'code' => ['nullable', 'string', 'size:6'],
        ];
    }
}
