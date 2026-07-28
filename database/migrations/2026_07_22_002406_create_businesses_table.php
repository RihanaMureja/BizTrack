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
        Schema::create('businesses', function (Blueprint $table) {
    $table->id();

    $table->foreignId('owner_id')
          ->constrained('users')
          ->cascadeOnDelete();

    $table->string('business_name');

    $table->string('business_type')->nullable();

    $table->string('phone')->nullable();

    $table->string('email')->nullable();

    $table->text('address')->nullable();

    $table->string('logo')->nullable();

    $table->boolean('status')->default(true);

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
