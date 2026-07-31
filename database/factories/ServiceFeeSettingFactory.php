<?php

namespace Database\Factories;

use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFeeSettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'fee_rate' => 1.00,
            'is_active' => true,
            'terms' => 'Default platform service fee agreement.',
            'effective_from' => now()->toDateString(),
        ];
    }
}
