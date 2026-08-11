<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppearanceThemeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === Role::Owner;
    }

    public function rules(): array
    {
        return [
            'theme_mode' => ['required', Rule::in(['logo', 'category', 'manual', 'default'])],
            'theme_primary' => ['required_if:theme_mode,manual', 'nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'theme_secondary' => ['required_if:theme_mode,manual', 'nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'theme_accent' => ['required_if:theme_mode,manual', 'nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }
}
