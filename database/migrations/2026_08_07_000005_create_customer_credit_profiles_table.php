<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_credit_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->decimal('suggested_credit_limit', 12, 2)->default(0);
            $table->decimal('owner_credit_limit_override', 12, 2)->nullable();
            $table->decimal('total_purchase_volume', 12, 2)->default(0);
            $table->decimal('on_time_payment_rate', 5, 2)->default(0);
            $table->decimal('average_order_value', 12, 2)->default(0);
            $table->unsignedInteger('customer_tenure_days')->default(0);
            $table->timestamp('calculated_at')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'customer_id'], 'credit_profiles_business_customer_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_credit_profiles');
    }
};
