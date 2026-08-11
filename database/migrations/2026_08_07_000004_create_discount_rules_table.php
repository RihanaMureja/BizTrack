<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discount_rules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->decimal('spend_threshold', 12, 2);
            $table->decimal('discount_percent', 5, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['business_id', 'is_active', 'spend_threshold'], 'discount_rules_lookup_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discount_rules');
    }
};
