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
            'national_id_fan_number' => ['required', 'string', 'max:80'],
            'national_id_photo' => [$this->user()?->ownedBusiness?->national_id_photo_path ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'trade_license' => [$this->user()?->ownedBusiness?->trade_license_path ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'tin_certificate' => [$this->user()?->ownedBusiness?->tin_certificate_path ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'is_vat_registered' => ['boolean'],
            'vat_certificate' => ['nullable', 'required_if:is_vat_registered,1,true,on', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'has_physical_shop' => ['boolean'],
            'rental_agreement' => ['nullable', 'required_if:has_physical_shop,1,true,on', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
        ];
    }
}
