<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            foreach (['submitted_for_review_at', 'approved_at', 'rejected_at', 'rejection_reason'] as $column) {
                if (Schema::hasColumn('businesses', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            if (! Schema::hasColumn('businesses', 'submitted_for_review_at')) {
                $table->timestamp('submitted_for_review_at')->nullable();
            }
        });
    }
};
