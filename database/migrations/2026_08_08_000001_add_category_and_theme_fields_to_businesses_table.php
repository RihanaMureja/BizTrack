<?php

use App\Enums\BusinessCategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            if (! Schema::hasColumn('businesses', 'business_category')) {
                $table->string('business_category')->default(BusinessCategory::RetailShop->value)->after('business_type')->index();
            }

            foreach (['theme_primary', 'theme_secondary', 'theme_accent', 'theme_background', 'theme_text'] as $column) {
                if (! Schema::hasColumn('businesses', $column)) {
                    $table->string($column, 20)->nullable()->after('logo');
                }
            }

            if (! Schema::hasColumn('businesses', 'theme_palette_source')) {
                $table->string('theme_palette_source')->nullable()->after('theme_text');
            }

            if (! Schema::hasColumn('businesses', 'theme_contrast_adjusted_at')) {
                $table->timestamp('theme_contrast_adjusted_at')->nullable()->after('theme_palette_source');
            }
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            foreach (['business_category', 'theme_primary', 'theme_secondary', 'theme_accent', 'theme_background', 'theme_text', 'theme_palette_source', 'theme_contrast_adjusted_at'] as $column) {
                if (Schema::hasColumn('businesses', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
