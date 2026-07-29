<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Business;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Payment> */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'sale_id' => Sale::factory(),
            'customer_id' => null,
            'user_id' => User::factory(),
            'payment_number' => 'PAY-TEST-'.fake()->unique()->numerify('####'),
            'method' => PaymentMethod::Cash,
            'status' => PaymentStatus::Completed,
            'amount' => 100,
            'reference' => fake()->optional()->bothify('REF-####'),
            'notes' => null,
            'paid_at' => now(),
            'verified_at' => now(),
        ];
    }
}
