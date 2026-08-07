<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('business_verification_reviews');
    }

    public function down(): void
    {
        Schema::create('business_verification_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('decision');
            $table->text('reason')->nullable();
            $table->json('document_reviews')->nullable();
            $table->timestamps();
        });
    }
};
