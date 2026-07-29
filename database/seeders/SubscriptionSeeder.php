<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Models\Subscription;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'price' => 0,
                'duration_months' => 1,
                'max_cashiers' => 1,
                'description' => 'For a new shop starting digital records with one cashier.',
            ],
            [
                'name' => 'Growth',
                'price' => 499,
                'duration_months' => 1,
                'max_cashiers' => 5,
                'description' => 'For growing businesses that need more cashier accounts and reports.',
            ],
            [
                'name' => 'Pro',
                'price' => 999,
                'duration_months' => 1,
                'max_cashiers' => 15,
                'description' => 'For established teams that need larger staff capacity.',
            ],
        ];

        foreach ($plans as $plan) {
            Subscription::updateOrCreate(
                ['name' => $plan['name']],
                [...$plan, 'status' => RecordStatus::Active],
            );
        }
    }
}
