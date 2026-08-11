<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BusinessProfileRequest extends FormRequest
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
        $business = $this->user()?->ownedBusiness;

        return [
            'business_name' => ['required', 'string', 'max:150'],
            'business_type' => ['nullable', 'string', 'max:100'],
            'email' => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('businesses', 'email')->ignore($business?->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:1000'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'national_id_fan_number' => ['required', 'string', 'max:80'],
            'national_id_photo' => [$business?->national_id_photo_path ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'trade_license' => [$business?->trade_license_path ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'tin_certificate' => [$business?->tin_certificate_path ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'is_vat_registered' => ['boolean'],
            'vat_certificate' => [
                'nullable',
                Rule::requiredIf(fn () => (bool) $this->input('is_vat_registered') && ! $business?->vat_certificate_path),
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:4096',
            ],
            'has_physical_shop' => ['boolean'],
            'rental_agreement' => [
                'nullable',
                Rule::requiredIf(fn () => (bool) $this->input('has_physical_shop') && ! $business?->rental_agreement_path),
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:4096',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'logo.image' => 'The logo must be a valid image file (JPG, JPEG, PNG, or WEBP).',
            'logo.mimes' => 'The logo must be a JPG, JPEG, PNG, or WEBP file.',
            'logo.max' => 'The logo must not be larger than 2MB.',
        ];
    }
}
