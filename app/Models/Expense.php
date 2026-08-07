<?php

namespace App\Models;

use App\Enums\ExpenseSource;
use App\Enums\ExpenseStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'expense_category_id', 'user_id', 'title', 'amount', 'expense_date', 'status', 'source', 'source_reference_type', 'source_reference_id', 'source_period', 'vendor', 'receipt_path', 'notes'])]
class Expense extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expense_date' => 'date',
            'status' => ExpenseStatus::class,
            'source' => ExpenseSource::class,
        ];
    }

    public function business(): BelongsTo { return $this->belongsTo(Business::class); }
    public function category(): BelongsTo { return $this->belongsTo(ExpenseCategory::class, 'expense_category_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public function sourceReference()
    {
        return $this->morphTo(__FUNCTION__, 'source_reference_type', 'source_reference_id');
    }
}
