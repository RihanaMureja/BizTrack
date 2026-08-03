<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_verification_reviews', function (Blueprint $table) {
            if (! Schema::hasColumn('business_verification_reviews', 'document_reviews')) {
                $table->json('document_reviews')->nullable()->after('reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('business_verification_reviews', function (Blueprint $table) {
            if (Schema::hasColumn('business_verification_reviews', 'document_reviews')) {
                $table->dropColumn('document_reviews');
            }
        });
    }
};
