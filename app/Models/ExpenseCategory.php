<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['business_id', 'name', 'description'])]
class ExpenseCategory extends Model
{
    use HasFactory;

    public function business(): BelongsTo { return $this->belongsTo(Business::class); }
    public function expenses(): HasMany { return $this->hasMany(Expense::class); }
}
