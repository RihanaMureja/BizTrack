<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            if (! Schema::hasColumn('businesses', 'theme_mode')) {
                $table->string('theme_mode')->default('default')->after('theme_text')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            if (Schema::hasColumn('businesses', 'theme_mode')) {
                $table->dropColumn('theme_mode');
            }
        });
    }
};
