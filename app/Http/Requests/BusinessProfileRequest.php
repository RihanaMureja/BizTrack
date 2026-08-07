<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
            'subscription_id' => ['nullable', Rule::exists('subscriptions', 'id')->where('status', 'active')],
            'email' => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('businesses', 'email')->ignore($this->user()?->ownedBusiness?->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:1000'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'national_id_fan_number' => ['nullable', 'string', 'max:80'],
            'national_id_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'trade_license' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'tin_certificate' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'is_vat_registered' => ['boolean'],
            'vat_certificate' => [
                Rule::requiredIf(fn (): bool => $this->boolean('is_vat_registered') && blank($business?->vat_certificate_path)),
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:4096',
            ],
            'has_physical_shop' => ['boolean'],
            'rental_agreement' => [
                Rule::requiredIf(fn (): bool => $this->boolean('has_physical_shop') && blank($business?->rental_agreement_path)),
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:4096',
            ],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (! $this->boolean('is_vat_registered') && $this->hasFile('vat_certificate')) {
                    $validator->errors()->add('vat_certificate', 'Only upload a VAT certificate when the business is VAT registered.');
                }

                if (! $this->boolean('has_physical_shop') && $this->hasFile('rental_agreement')) {
                    $validator->errors()->add('rental_agreement', 'Only upload a rental agreement when the business has a physical shop.');
                }
            },
        ];
    }
}
