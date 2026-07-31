<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('must_reset_password')->default(false)->after('preferences');
            $table->timestamp('password_changed_at')->nullable()->after('must_reset_password');
            $table->timestamp('temporary_password_expires_at')->nullable()->after('password_changed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['must_reset_password', 'password_changed_at', 'temporary_password_expires_at']);
        });
    }
};
