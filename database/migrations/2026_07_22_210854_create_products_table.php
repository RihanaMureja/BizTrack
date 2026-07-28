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
    Schema::create('products', function (Blueprint $table) {

        $table->id();

        $table->foreignId('business_id')
              ->constrained('businesses')
              ->cascadeOnDelete();

        $table->foreignId('category_id')
              ->constrained('categories')
              ->cascadeOnDelete();

        $table->string('product_name');

        $table->string('sku')->unique();

        $table->decimal('buy_price', 10, 2);

        $table->decimal('sell_price', 10, 2);

        $table->integer('quantity')->default(0);

        $table->integer('reorder_level')->default(10);

        $table->boolean('status')->default(true);

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
