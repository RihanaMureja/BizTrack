<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('orders', function (Blueprint $table) {

        $table->id();
        $table->string('order_number')->unique();

        // Customer who placed the order
        $table->foreignId('customer_id')
              ->constrained('customers')
              ->cascadeOnDelete();

        // Business that receives the order
        $table->foreignId('business_id')
              ->constrained('businesses')
              ->cascadeOnDelete();

        // Optional cashier (owner can handle orders alone)
        $table->foreignId('cashier_id')
              ->nullable()
              ->constrained('users')
              ->nullOnDelete();

        // Order status
        $table->enum('status', [
            'pending',
            'completed',
            'cancelled'
        ])->default('pending');

        // Payment method
        $table->enum('payment_method', [
            'cash',
            'bank_transfer',
            'mobile_payment'
        ])->nullable();

        // Total order amount
        $table->decimal('total_amount', 10, 2)
              ->default(0);

        $table->timestamps();

    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
