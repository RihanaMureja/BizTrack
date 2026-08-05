<?php

namespace Database\Seeders;

use App\Models\SecurityQuestion;
use Illuminate\Database\Seeder;

class SecurityQuestionSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'What was the name of your first school?',
            'What city were you born in?',
            'What is the name of your favorite teacher?',
            'What was your childhood nickname?',
            'What is the name of your first employer?',
        ] as $question) {
            SecurityQuestion::updateOrCreate(
                ['question' => $question],
                ['is_active' => true],
            );
        }
    }
}
