<?php

namespace App\Http\Requests;

use App\Enums\BusinessPermissionKey;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasBusinessPermission(BusinessPermissionKey::ViewReports) ?? false;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['sales', 'expenses', 'profit', 'inventory', 'tax'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ];
    }
}
