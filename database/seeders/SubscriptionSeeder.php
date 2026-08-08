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
                'name' => 'Free Trial',
                'price' => 0,
                'duration_months' => 1,
                'duration_days' => 30,
                'max_cashiers' => 1,
                'description' => 'Free for the first 30 days so you can explore BizTrack with one cashier account.',
                'features' => [
                    '1 cashier account',
                    'Up to 30 days of free access',
                    'Basic reports and inventory',
                    'Email support',
                ],
            ],
            [
                'name' => 'Growth',
                'price' => 499,
                'duration_months' => 1,
                'duration_days' => null,
                'max_cashiers' => 5,
                'description' => 'For growing businesses that need more cashier accounts and advanced reports.',
                'features' => [
                    '5 cashier accounts',
                    'Unlimited products and inventory',
                    'Advanced reports and insights',
                    'Priority support',
                ],
            ],
            [
                'name' => 'Pro',
                'price' => 999,
                'duration_months' => 1,
                'duration_days' => null,
                'max_cashiers' => 15,
                'description' => 'For established teams that need larger staff capacity and the full BizTrack experience.',
                'features' => [
                    '15 cashier accounts',
                    'Everything in Growth',
                    'Multi-branch support',
                    'Dedicated support',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            Subscription::updateOrCreate(
                ['name' => $plan['name']],
                [...$plan, 'status' => RecordStatus::Active],
            );
        }

        Subscription::whereNotIn('name', array_column($plans, 'name'))
            ->update(['status' => RecordStatus::Inactive->value]);
    }
}
