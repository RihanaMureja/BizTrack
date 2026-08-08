<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('customer_type', 30)->default('retail')->index()->after('full_name');
            $table->string('company_name', 255)->nullable()->after('customer_type');
            $table->decimal('default_discount', 5, 2)->default(0)->after('credit_limit');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['customer_type', 'company_name', 'default_discount']);
        });
    }
};
