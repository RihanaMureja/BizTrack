<?php

use App\Enums\BusinessAccessMode;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            if (! Schema::hasColumn('businesses', 'access_mode')) {
                $table->string('access_mode', 40)->default(BusinessAccessMode::Onboarding->value)->after('status')->index();
            }

            if (! Schema::hasColumn('businesses', 'onboarding_completed_at')) {
                $table->timestamp('onboarding_completed_at')->nullable()->after('access_mode');
            }

            if (! Schema::hasColumn('businesses', 'trial_started_at')) {
                $table->timestamp('trial_started_at')->nullable()->after('onboarding_completed_at');
            }

            if (! Schema::hasColumn('businesses', 'trial_ends_at')) {
                $table->timestamp('trial_ends_at')->nullable()->after('trial_started_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            foreach (['trial_ends_at', 'trial_started_at', 'onboarding_completed_at', 'access_mode'] as $column) {
                if (Schema::hasColumn('businesses', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
