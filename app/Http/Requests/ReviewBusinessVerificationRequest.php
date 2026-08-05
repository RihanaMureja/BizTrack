<?php

namespace App\Http\Requests;

use App\Enums\BusinessVerificationDecision;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
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
            'document_reviews' => ['nullable', 'array'],
            'document_reviews.*.document_id' => ['required', 'integer', Rule::exists('business_verification_documents', 'id')],
            'document_reviews.*.decision' => ['required', Rule::in(array_map(fn (BusinessVerificationDecision $decision): string => $decision->value, BusinessVerificationDecision::cases()))],
            'document_reviews.*.notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $business = $this->route('business');
                $documents = $business?->verificationDocuments()->pluck('id')->map(fn ($id): int => (int) $id)->all() ?? [];
                $reviews = collect($this->input('document_reviews', []));

                if ($documents !== [] && $reviews->count() !== count($documents)) {
                    $validator->errors()->add('document_reviews', 'Review every submitted document before submitting the final decision.');

                    return;
                }

                $reviewedIds = $reviews->pluck('document_id')->map(fn ($id): int => (int) $id)->sort()->values()->all();
                $documentIds = collect($documents)->sort()->values()->all();

                if ($documentIds !== [] && $reviewedIds !== $documentIds) {
                    $validator->errors()->add('document_reviews', 'The document checklist does not match the submitted documents.');
                }

                if ($this->input('decision') === BusinessVerificationDecision::Approved->value
                    && $reviews->contains(fn ($review): bool => ($review['decision'] ?? null) !== BusinessVerificationDecision::Approved->value)) {
                    $validator->errors()->add('document_reviews', 'All documents must be marked approved before the business can be approved.');
                }
            },
        ];
    }
}
