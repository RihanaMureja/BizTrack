<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('inventory_batches')) {
            return;
        }

        Schema::create('inventory_batches', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('batch_number');
            $table->unsignedInteger('quantity_received');
            $table->unsignedInteger('quantity_remaining');
            $table->decimal('unit_cost', 12, 2);
            $table->timestamp('received_at')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'batch_number'], 'inv_batches_business_batch_unique');
            $table->index(['product_id', 'quantity_remaining', 'received_at'], 'inv_batches_product_stock_received_idx');
            $table->index(['business_id', 'expiry_date'], 'inv_batches_business_expiry_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_batches');
    }
};
