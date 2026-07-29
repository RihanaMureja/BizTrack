<?php

namespace Database\Factories;

use App\Enums\NotificationType;
use App\Models\Business;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Notification> */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'message' => fake()->sentence(),
            'type' => NotificationType::DailySales,
            'is_read' => false,
        ];
    }
}
