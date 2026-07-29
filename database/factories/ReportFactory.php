<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Report> */
class ReportFactory extends Factory
{
    protected $model = Report::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'user_id' => User::factory(),
            'type' => 'profit',
            'title' => 'Profit Report',
            'date_from' => today()->subDays(29),
            'date_to' => today(),
            'filters' => ['type' => 'profit'],
            'summary' => ['revenue' => 0, 'expenses' => 0, 'profit' => 0],
            'generated_at' => now(),
        ];
    }
}
