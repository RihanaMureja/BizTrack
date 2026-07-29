<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BusinessSeeder extends Seeder
{
    public function run(): void
    {
        $subscription = Subscription::query()->where('name', 'Growth')->first() ?? Subscription::query()->first();

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
            ['email' => 'hello@merkato-fresh.test'],
            [
                'owner_id' => $owner->id,
                'subscription_id' => $subscription?->id,
                'business_name' => 'Merkato Fresh Mart',
                'business_type' => 'Retail',
                'phone' => '0911223344',
                'address' => 'Addis Ababa',
                'status' => RecordStatus::Active,
            ],
        );

        $owner->forceFill(['business_id' => $business->id])->save();
    }
}
