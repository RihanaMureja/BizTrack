<?php

namespace App\Http\Requests;

use App\Enums\RecordStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubscriptionSelectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'plan_id' => [
                'required',
                'integer',
                Rule::exists('subscriptions', 'id')->where(fn ($query) => $query->where('status', RecordStatus::Active->value)),
            ],
            'back' => [
                'nullable',
                'string',
                Rule::in(['/business/subscriptions', '/subscriptions']),
            ],
        ];
    }
}
