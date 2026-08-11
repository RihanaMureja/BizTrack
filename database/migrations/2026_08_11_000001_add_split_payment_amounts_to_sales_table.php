<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table): void {
            $table->decimal('cash_amount', 12, 2)->default(0)->after('is_credit_sale');
            $table->decimal('credit_amount', 12, 2)->default(0)->after('cash_amount');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table): void {
            $table->dropColumn(['cash_amount', 'credit_amount']);
        });
    }
};
