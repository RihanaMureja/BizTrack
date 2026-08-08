<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\SubscriptionPaymentStatus;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SubscriptionPayment> */
class SubscriptionPaymentFactory extends Factory
{
    protected $model = SubscriptionPayment::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'subscription_id' => Subscription::factory(),
            'user_id' => User::factory(),
            'amount' => 499,
            'method' => PaymentMethod::Chapa,
            'status' => SubscriptionPaymentStatus::Pending,
            'reference' => 'sbt_'.fake()->unique()->numerify('#########'),
        ];
    }
}
