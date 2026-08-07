<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_transactions', function (Blueprint $table): void {
            $table->foreignId('inventory_batch_id')
                ->nullable()
                ->after('inventory_id')
                ->constrained('inventory_batches')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('inventory_transactions', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('inventory_batch_id');
        });
    }
};
