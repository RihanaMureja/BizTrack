<?php

use App\Enums\ProductInsightStatus;
use App\Enums\ProductInsightType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_movement_insights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default(ProductInsightType::Stagnant->value)->index();
            $table->string('status')->default(ProductInsightStatus::Open->value)->index();
            $table->unsignedInteger('days_without_sale');
            $table->unsignedInteger('threshold_days');
            $table->unsignedInteger('stock_on_hand')->default(0);
            $table->dateTime('last_sold_at')->nullable();
            $table->dateTime('detected_at');
            $table->dateTime('notified_at')->nullable();
            $table->dateTime('dismissed_at')->nullable();
            $table->dateTime('resolved_at')->nullable();
            $table->text('suggested_action')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'type', 'status'], 'product_insight_current_unique');
            $table->index(['business_id', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_movement_insights');
    }
};
