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
    Schema::create('sales', function (Blueprint $table) {

        $table->id();

        // Related order
        $table->foreignId('order_id')
              ->constrained('orders')
              ->cascadeOnDelete();

        // Total money received from customer
        $table->decimal('total_amount', 10, 2);

        // Business profit
        $table->decimal('profit', 10, 2);

        $table->timestamps();

    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
