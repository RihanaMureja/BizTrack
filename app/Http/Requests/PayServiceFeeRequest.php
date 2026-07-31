<?php

namespace App\Http\Requests;

use App\Enums\ServiceFeeStatus;
use Illuminate\Foundation\Http\FormRequest;

class PayServiceFeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $serviceFee = $this->route('serviceFee');

        return $this->user()?->isOwner()
            && $serviceFee
            && $serviceFee->business_id === $this->user()->ownedBusiness?->id
            && $serviceFee->status === ServiceFeeStatus::Unpaid;
    }

    public function rules(): array
    {
        return [];
    }
}
