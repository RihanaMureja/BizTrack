<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('service_fees');
        Schema::dropIfExists('service_fee_settings');
    }

    public function down(): void
    {
        Schema::create('service_fee_settings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('fee_rate', 5, 2)->default(1);
            $table->boolean('is_active')->default(true)->index();
            $table->text('terms')->nullable();
            $table->date('effective_from')->nullable();
            $table->timestamps();
        });

        Schema::create('service_fees', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('service_fee_setting_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('fee_rate', 5, 2);
            $table->decimal('payment_amount', 12, 2);
            $table->decimal('fee_amount', 12, 2);
            $table->string('status')->default('unpaid')->index();
            $table->text('description')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('waived_at')->nullable();
            $table->timestamps();
        });
    }
};
