<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BusinessOwnerSeeder extends Seeder
{
    public function run(): void
    {
        $subscription = Subscription::firstOrCreate(
            ['name' => 'Starter'],
            [
                'price' => 0,
                'duration_months' => 1,
                'max_cashiers' => 1,
                'description' => 'Starter business workspace',
                'status' => RecordStatus::Active,
            ],
        );

        $owner = User::updateOrCreate(
            ['email' => 'owner@biztrack.test'],
            [
                'first_name' => 'BizTrack',
                'last_name' => 'Owner',
                'name' => 'BizTrack Owner',
                'phone' => '0911000000',
                'password' => Hash::make('password'),
                'role' => Role::Owner,
                'status' => RecordStatus::Active,
                'email_verified_at' => now(),
            ],
        );

        $business = Business::updateOrCreate(
            ['owner_id' => $owner->id],
            [
                'subscription_id' => $subscription->id,
                'business_name' => 'BizTrack Sample Business',
                'business_type' => 'Retail',
                'email' => 'business@biztrack.test',
                'phone' => '0911000001',
                'address' => 'Addis Ababa',
                'status' => RecordStatus::Active,
            ],
        );

        $owner->forceFill(['business_id' => $business->id])->save();
    }
}
