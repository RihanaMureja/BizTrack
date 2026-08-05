<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<AuditLog> */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'user_id' => User::factory(),
            'action' => fake()->randomElement(['product.created', 'sale.completed', 'payment.completed', 'expense.updated']),
            'table_name' => fake()->randomElement(['products', 'sales', 'payments', 'expenses']),
            'record_id' => fake()->numberBetween(1, 5000),
            'old_values' => null,
            'new_values' => ['name' => fake()->words(2, true)],
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }
}
