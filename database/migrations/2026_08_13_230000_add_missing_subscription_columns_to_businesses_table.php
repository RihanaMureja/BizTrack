<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            if (! Schema::hasColumn('businesses', 'subscription_started_at')) {
                $table->timestamp('subscription_started_at')->nullable()->after('subscription_id');
            }

            if (! Schema::hasColumn('businesses', 'subscription_ends_at')) {
                $table->timestamp('subscription_ends_at')->nullable()->after('subscription_started_at');
            }

            if (! Schema::hasColumn('businesses', 'subscription_status')) {
                $table->string('subscription_status', 20)->default('none')->index()->after('subscription_ends_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('businesses', 'subscription_status')) {
                $columns[] = 'subscription_status';
            }

            if (Schema::hasColumn('businesses', 'subscription_ends_at')) {
                $columns[] = 'subscription_ends_at';
            }

            if (Schema::hasColumn('businesses', 'subscription_started_at')) {
                $columns[] = 'subscription_started_at';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
