<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        Business::query()->each(function (Business $business): void {
            $email = $business->id === 1
                ? 'cashier@biztrack.test'
                : 'cashier'.$business->id.'@biztrack.test';

            User::updateOrCreate(
                ['email' => $email],
                [
                    'business_id' => $business->id,
                    'first_name' => 'BizTrack',
                    'last_name' => 'Cashier',
                    'name' => 'BizTrack Cashier',
                    'phone' => '0911000002',
                    'password' => Hash::make('password'),
                    'role' => Role::Cashier,
                    'status' => RecordStatus::Active,
                    'email_verified_at' => now(),
                ],
            );
        });
    }
}
