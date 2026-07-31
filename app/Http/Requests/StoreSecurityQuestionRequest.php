<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSecurityQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'security_question_id' => ['required', 'integer', Rule::exists('security_questions', 'id')->where('is_active', true)],
            'answer' => ['required', 'string', 'min:2', 'max:150'],
        ];
    }
}
