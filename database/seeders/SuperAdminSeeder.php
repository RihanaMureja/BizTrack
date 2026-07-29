<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@biztrack.test'],
            [
                'first_name' => 'BizTrack',
                'last_name' => 'Admin',
                'name' => 'BizTrack Admin',
                'phone' => '0911000001',
                'password' => Hash::make('password'),
                'role' => Role::SuperAdmin,
                'status' => RecordStatus::Active,
                'email_verified_at' => now(),
            ],
        );
    }
}
