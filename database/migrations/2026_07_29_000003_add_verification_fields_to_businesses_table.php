<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            if (! Schema::hasColumn('businesses', 'national_id_fan_number')) {
                $table->string('national_id_fan_number', 80)->nullable()->after('logo');
                $table->string('national_id_photo_path')->nullable()->after('national_id_fan_number');
                $table->string('trade_license_path')->nullable()->after('national_id_photo_path');
                $table->string('tin_certificate_path')->nullable()->after('trade_license_path');
                $table->boolean('is_vat_registered')->default(false)->after('tin_certificate_path');
                $table->string('vat_certificate_path')->nullable()->after('is_vat_registered');
                $table->boolean('has_physical_shop')->default(false)->after('vat_certificate_path');
                $table->string('rental_agreement_path')->nullable()->after('has_physical_shop');
                $table->timestamp('submitted_for_review_at')->nullable()->after('rental_agreement_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            foreach ([
                'submitted_for_review_at',
                'rental_agreement_path',
                'has_physical_shop',
                'vat_certificate_path',
                'is_vat_registered',
                'tin_certificate_path',
                'trade_license_path',
                'national_id_photo_path',
                'national_id_fan_number',
            ] as $column) {
                if (Schema::hasColumn('businesses', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
