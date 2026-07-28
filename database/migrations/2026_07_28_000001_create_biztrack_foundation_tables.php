<?php

use App\Enums\RecordStatus;
use App\Enums\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->decimal('price', 10, 2)->default(0);
            $table->unsignedInteger('duration_months')->default(1);
            $table->unsignedInteger('max_cashiers')->default(1);
            $table->text('description')->nullable();
            $table->string('status')->default(RecordStatus::Active->value)->index();
            $table->timestamps();
        });

        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->string('business_name', 150);
            $table->string('business_type', 100)->nullable();
            $table->string('email', 150)->nullable()->unique();
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('logo')->nullable();
            $table->string('status')->default(RecordStatus::Active->value)->index();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('business_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('first_name', 100)->nullable()->after('business_id');
            $table->string('last_name', 100)->nullable()->after('first_name');
            $table->string('phone', 20)->nullable()->after('email');
            $table->string('role')->default(Role::Owner->value)->after('password')->index();
            $table->string('status')->default(RecordStatus::Active->value)->after('role')->index();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 150);
            $table->string('table_name', 100)->nullable();
            $table->unsignedBigInteger('record_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('message');
            $table->string('type')->index();
            $table->boolean('is_read')->default(false)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('audit_logs');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('business_id');
            $table->dropColumn(['first_name', 'last_name', 'phone', 'role', 'status']);
        });

        Schema::dropIfExists('businesses');
        Schema::dropIfExists('subscriptions');
    }
};
