<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table): void {
            $table->string('category', 40)->nullable()->after('type')->index();
            $table->string('priority', 20)->nullable()->after('category')->index();
            $table->foreignId('related_user_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            $table->string('action_url')->nullable()->after('message');
            $table->string('dedupe_key')->nullable()->after('action_url');
            $table->timestamp('dismissed_at')->nullable()->after('is_read')->index();

            $table->unique(['user_id', 'dedupe_key'], 'notifications_user_dedupe_unique');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table): void {
            $table->dropUnique('notifications_user_dedupe_unique');
            $table->dropConstrainedForeignId('related_user_id');
            $table->dropColumn(['category', 'priority', 'action_url', 'dedupe_key', 'dismissed_at']);
        });
    }
};
