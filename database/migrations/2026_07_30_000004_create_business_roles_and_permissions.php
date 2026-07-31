<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->string('name', 150);
            $table->string('group', 100)->index();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('business_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_default')->default(false)->index();
            $table->timestamps();

            $table->unique(['business_id', 'name']);
        });

        Schema::create('business_permission_business_role', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('business_permission_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['business_role_id', 'business_permission_id'], 'business_role_permission_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('business_role_id')->nullable()->after('business_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('business_role_id');
        });

        Schema::dropIfExists('business_permission_business_role');
        Schema::dropIfExists('business_roles');
        Schema::dropIfExists('business_permissions');
    }
};
