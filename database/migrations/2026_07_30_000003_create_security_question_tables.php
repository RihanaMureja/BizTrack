<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_questions', function (Blueprint $table) {
            $table->id();
            $table->string('question', 255)->unique();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('user_security_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('security_question_id')->constrained()->cascadeOnDelete();
            $table->string('answer_hash');
            $table->timestamps();

            $table->unique(['user_id', 'security_question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_security_questions');
        Schema::dropIfExists('security_questions');
    }
};
