<?php

use App\Enums\ExpenseStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expense_categories', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->unique(['business_id', 'name']);
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->renameColumn('category_id', 'expense_category_id');
            $table->renameColumn('description', 'notes');
            $table->renameColumn('date', 'expense_date');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 160)->nullable();
            $table->string('status')->default(ExpenseStatus::Approved->value)->index();
            $table->string('vendor')->nullable();
            $table->string('receipt_path')->nullable();
        });

        // Preserve existing records by using their prior description as the title.
        $notesPrefix = DB::getDriverName() === 'sqlite' ? 'substr(notes, 1, 160)' : 'LEFT(notes, 160)';
        DB::table('expenses')->whereNull('title')->update([
            'title' => DB::raw("COALESCE(NULLIF({$notesPrefix}, ''), 'Expense')"),
        ]);
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'title', 'status', 'vendor', 'receipt_path']);
            $table->renameColumn('expense_category_id', 'category_id');
            $table->renameColumn('notes', 'description');
            $table->renameColumn('expense_date', 'date');
        });

        Schema::table('expense_categories', function (Blueprint $table) {
            $table->dropUnique(['business_id', 'name']);
            $table->dropColumn('description');
        });
    }
};
