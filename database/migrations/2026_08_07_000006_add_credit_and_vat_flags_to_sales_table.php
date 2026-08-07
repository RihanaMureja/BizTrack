<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table): void {
            $table->boolean('is_credit_sale')->default(false)->after('customer_id');
            $table->boolean('vat_enabled')->default(false)->after('discount_amount');
            $table->decimal('vat_rate', 5, 2)->default(0)->after('vat_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table): void {
            $table->dropColumn(['is_credit_sale', 'vat_enabled', 'vat_rate']);
        });
    }
};
