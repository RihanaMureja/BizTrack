<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['business_id', 'fee_rate', 'is_active', 'terms', 'effective_from'])]
class ServiceFeeSetting extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'fee_rate' => 'decimal:2',
            'is_active' => 'boolean',
            'effective_from' => 'date',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function serviceFees(): HasMany
    {
        return $this->hasMany(ServiceFee::class);
    }
}
