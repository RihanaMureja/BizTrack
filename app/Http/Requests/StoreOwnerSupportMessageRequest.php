<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class StoreOwnerSupportMessageRequest extends StoreContactMessageRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === Role::Owner;
    }
}
