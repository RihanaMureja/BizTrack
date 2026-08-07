<?php

use App\Enums\ExpenseSource;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table): void {
            if (! Schema::hasColumn('expenses', 'source')) {
                $table->string('source')->default(ExpenseSource::Manual->value)->after('status')->index();
            }

            if (! Schema::hasColumn('expenses', 'source_reference_type')) {
                $table->string('source_reference_type')->nullable()->after('source');
            }

            if (! Schema::hasColumn('expenses', 'source_reference_id')) {
                $table->unsignedBigInteger('source_reference_id')->nullable()->after('source_reference_type');
            }

            if (! Schema::hasColumn('expenses', 'source_period')) {
                $table->string('source_period', 7)->nullable()->after('source_reference_id');
            }
        });

        Schema::table('expenses', function (Blueprint $table): void {
            $table->index(['business_id', 'source', 'source_period'], 'expenses_business_source_period_idx');
            $table->index(['source_reference_type', 'source_reference_id'], 'expenses_source_ref_idx');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table): void {
            $table->dropIndex('expenses_business_source_period_idx');
            $table->dropIndex('expenses_source_ref_idx');
            $table->dropColumn(['source', 'source_reference_type', 'source_reference_id', 'source_period']);
        });
    }
};
