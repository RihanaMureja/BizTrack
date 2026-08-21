<?php

namespace Database\Factories;

use App\Enums\ContactMessageSource;
use App\Enums\ContactMessageStatus;
use App\Models\ContactMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ContactMessage> */
class ContactMessageFactory extends Factory
{
    protected $model = ContactMessage::class;

    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->optional()->phoneNumber(),
            'subject' => fake()->sentence(4),
            'message' => fake()->paragraph(3),
            'source' => ContactMessageSource::Landing,
            'status' => ContactMessageStatus::New,
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }
}
