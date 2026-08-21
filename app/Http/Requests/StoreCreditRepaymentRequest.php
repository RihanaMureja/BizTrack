<?php

namespace App\Http\Requests;

use App\Models\CustomerCredit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreCreditRepaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() || $this->user()?->isCashier();
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'payment_lines' => ['required', 'array', 'min:1'],
            'payment_lines.*.method' => ['required', Rule::in(['cash', 'telebirr', 'mpesa', 'cbebirr', 'apollo'])],
            'payment_lines.*.amount' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'payment_lines.*.phone' => ['nullable', 'string', 'max:30'],
            'payment_lines.*.account_number' => ['nullable', 'string', 'max:60'],
            'payment_lines.*.reference' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $credit = $this->route('customerCredit');

                if (! $credit instanceof CustomerCredit) {
                    return;
                }

                $amount = round((float) $this->input('amount'), 2);
                $remainingBalance = round((float) $credit->remaining_balance, 2);
                $lineTotal = round(collect($this->input('payment_lines', []))->sum(
                    fn (array $line): float => (float) ($line['amount'] ?? 0)
                ), 2);

                if ($amount > $remainingBalance) {
                    $validator->errors()->add('amount', 'Repayment cannot exceed the outstanding credit balance.');
                }

                if ($lineTotal !== $amount) {
                    $validator->errors()->add('payment_lines', 'Payment method amounts must equal the repayment amount.');
                }

                foreach ($this->input('payment_lines', []) as $index => $line) {
                    $method = $line['method'] ?? null;

                    if (in_array($method, ['telebirr', 'mpesa', 'cbebirr'], true) && blank($line['phone'] ?? null)) {
                        $validator->errors()->add("payment_lines.$index.phone", 'Enter the customer phone number for this wallet repayment.');
                    }

                    if ($method === 'apollo' && blank($line['account_number'] ?? null)) {
                        $validator->errors()->add("payment_lines.$index.account_number", 'Enter the Apollo account number for this repayment.');
                    }
                }
            },
        ];
    }
}
