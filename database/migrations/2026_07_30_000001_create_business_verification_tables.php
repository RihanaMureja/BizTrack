<?php

use App\Enums\RecordStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_verification_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type', 80)->index();
            $table->string('label', 150);
            $table->string('path');
            $table->string('status')->default(RecordStatus::PendingReview->value)->index();
            $table->text('notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['business_id', 'type']);
        });

        Schema::create('business_verification_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('decision', 80)->index();
            $table->text('reason')->nullable();
            $table->string('status_before', 80)->nullable();
            $table->string('status_after', 80);
            $table->timestamp('reviewed_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_verification_reviews');
        Schema::dropIfExists('business_verification_documents');
    }
};
