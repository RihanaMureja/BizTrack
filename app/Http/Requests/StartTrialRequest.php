<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class StartTrialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === Role::Owner;
    }

    public function rules(): array
    {
        return [];
    }
}
