<?php

namespace Database\Factories;

use App\Enums\BusinessSubscriptionStatus;
use App\Enums\RecordStatus;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Business>
 */
class BusinessFactory extends Factory
{
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'subscription_id' => Subscription::factory(),
            'subscription_status' => BusinessSubscriptionStatus::Active,
            'subscription_started_at' => now(),
            'subscription_ends_at' => now()->addMonth(),
            'business_name' => fake()->company(),
            'business_type' => fake()->randomElement(['Retail', 'Cafe', 'Pharmacy', 'Service', 'Mini Market']),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'logo' => null,
            'status' => RecordStatus::Active,
        ];
    }
}
