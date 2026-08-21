<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_health_checks', function (Blueprint $table): void {
            $table->id();
            $table->string('status', 20)->index();
            $table->unsignedTinyInteger('score')->default(100);
            $table->json('checks');
            $table->json('incidents')->nullable();
            $table->timestamp('checked_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_health_checks');
    }
};
