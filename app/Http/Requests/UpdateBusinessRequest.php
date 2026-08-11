<?php

namespace App\Http\Requests;

class UpdateBusinessRequest extends BusinessProfileRequest
{
    /**
     * Profile edits are made from the Business Profile form, which only submits
     * onboarding/verification fields when the owner actually replaces them.
     * They must not be required just because a business still lacks them.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'national_id_fan_number' => ['nullable', 'string', 'max:80'],
            'national_id_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'trade_license' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'tin_certificate' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
        ];
    }
}
