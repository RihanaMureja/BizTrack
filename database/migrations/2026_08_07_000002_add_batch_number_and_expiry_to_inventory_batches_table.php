<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->string('batch_number', 32)->nullable()->after('id');
            $table->date('expires_at')->nullable()->after('received_at');
        });

        DB::table('inventory_batches')
            ->orderBy('id')
            ->select(['id', 'received_at'])
            ->chunkById(500, function ($batches): void {
                foreach ($batches as $batch) {
                    $prefix = 'BATCH-'.Carbon::parse($batch->received_at)->format('Ymd');
                    $sequence = DB::table('inventory_batches')
                        ->where('batch_number', 'like', $prefix.'-%')
                        ->count() + 1;

                    DB::table('inventory_batches')
                        ->where('id', $batch->id)
                        ->update(['batch_number' => $prefix.'-'.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT)]);
                }
            });

        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->string('batch_number', 32)->nullable(false)->change();
        });

        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->unique('batch_number');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->dropUnique('inventory_batches_batch_number_unique');
            $table->dropColumn(['batch_number', 'expires_at']);
        });
    }
};
