<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->json('features')->nullable()->after('description');
            $table->unsignedInteger('duration_days')->nullable()->after('duration_months');
        });

        Schema::table('businesses', function (Blueprint $table) {
            $table->timestamp('subscription_started_at')->nullable()->after('subscription_id');
            $table->timestamp('subscription_ends_at')->nullable()->after('subscription_started_at');
            $table->string('subscription_status', 20)->default('none')->index()->after('subscription_ends_at');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn(['subscription_started_at', 'subscription_ends_at', 'subscription_status']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['features', 'duration_days']);
        });
    }
};
