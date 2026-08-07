<?php

use App\Enums\CustomerType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->string('customer_type', 30)->default(CustomerType::Individual->value)->after('business_id')->index();
            $table->string('display_name', 150)->nullable()->after('customer_type');
            $table->string('contact_person', 150)->nullable()->after('display_name');
            $table->string('contact_person_phone', 20)->nullable()->after('contact_person');
        });

        DB::table('customers')->update([
            'customer_type' => CustomerType::Individual->value,
            'display_name' => DB::raw('full_name'),
        ]);
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->dropIndex(['customer_type']);
            $table->dropColumn([
                'customer_type',
                'display_name',
                'contact_person',
                'contact_person_phone',
            ]);
        });
    }
};
