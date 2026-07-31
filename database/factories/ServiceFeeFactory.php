<?php

namespace Database\Factories;

use App\Enums\ServiceFeeStatus;
use App\Models\Business;
use App\Models\Payment;
use App\Models\ServiceFeeSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFeeFactory extends Factory
{
    public function definition(): array
    {
        $paymentAmount = $this->faker->randomFloat(2, 100, 10000);
        $rate = 1.00;

        return [
            'business_id' => Business::factory(),
            'payment_id' => Payment::factory(),
            'service_fee_setting_id' => ServiceFeeSetting::factory(),
            'fee_rate' => $rate,
            'payment_amount' => $paymentAmount,
            'fee_amount' => round($paymentAmount * $rate / 100, 2),
            'status' => ServiceFeeStatus::Unpaid,
            'description' => 'Platform service fee from completed payment.',
        ];
    }
}
