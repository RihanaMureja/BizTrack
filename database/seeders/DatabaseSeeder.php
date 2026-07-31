<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            SecurityQuestionSeeder::class,
            BusinessPermissionSeeder::class,
            SubscriptionSeeder::class,
            SuperAdminSeeder::class,
            BusinessSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            CustomerSeeder::class,
            ExpenseSeeder::class,
            UserSeeder::class,
        ]);
    }
}
