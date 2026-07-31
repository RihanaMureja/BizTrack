<?php

namespace App\Http\Requests;

use App\Enums\BusinessVerificationDecision;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewBusinessVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::enum(BusinessVerificationDecision::class)],
            'reason' => [
                Rule::requiredIf(fn (): bool => in_array($this->input('decision'), [
                    BusinessVerificationDecision::Rejected->value,
                    BusinessVerificationDecision::ResubmissionRequired->value,
                ], true)),
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }
}
