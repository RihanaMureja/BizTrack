<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * @var list<array{full_name: string, phone: string, email: string, address: string, credit_limit: float, current_balance: float}>
     */
    private const CUSTOMERS = [
        ['full_name' => 'Abel Tesfaye', 'phone' => '0911001001', 'email' => 'abel.customer@biztrack.test', 'address' => 'Bole, Addis Ababa', 'credit_limit' => 5000, 'current_balance' => 1200],
        ['full_name' => 'Mekdes Alemu', 'phone' => '0911001002', 'email' => 'mekdes.customer@biztrack.test', 'address' => 'Piassa, Addis Ababa', 'credit_limit' => 3000, 'current_balance' => 0],
        ['full_name' => 'Dawit Bekele', 'phone' => '0911001003', 'email' => 'dawit.customer@biztrack.test', 'address' => 'CMC, Addis Ababa', 'credit_limit' => 7000, 'current_balance' => 2500],
    ];

    public function run(): void
    {
        Business::query()->each(function (Business $business): void {
            foreach (self::CUSTOMERS as $customer) {
                Customer::updateOrCreate(
                    ['business_id' => $business->id, 'email' => $customer['email']],
                    $customer,
                );
            }
        });
    }
}
