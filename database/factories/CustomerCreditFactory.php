<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Business;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CustomerCredit> */
class CustomerCreditFactory extends Factory
{
    protected $model = CustomerCredit::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'customer_id' => Customer::factory(),
            'sale_id' => Sale::factory(),
            'credit_amount' => 100,
            'paid_amount' => 0,
            'remaining_balance' => 100,
            'status' => PaymentStatus::Unpaid,
            'due_date' => today()->addDays(30),
            'paid_at' => null,
            'reminded_at' => null,
        ];
    }
}
