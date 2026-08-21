<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_movement_insights', function (Blueprint $table) {
            $table->decimal('discount_price', 12, 2)->nullable()->after('stock_on_hand');
            $table->decimal('discount_percent', 5, 2)->nullable()->after('discount_price');
            $table->boolean('allow_below_cost')->default(false)->after('discount_percent');
            $table->text('discount_reason')->nullable()->after('allow_below_cost');
            $table->timestamp('discount_applied_at')->nullable()->after('discount_reason');
            $table->foreignId('discount_applied_by')->nullable()->after('discount_applied_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('product_movement_insights', function (Blueprint $table) {
            $table->dropConstrainedForeignId('discount_applied_by');
            $table->dropColumn([
                'discount_price',
                'discount_percent',
                'allow_below_cost',
                'discount_reason',
                'discount_applied_at',
            ]);
        });
    }
};
