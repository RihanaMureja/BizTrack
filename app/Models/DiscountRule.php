<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'name', 'spend_threshold', 'discount_percent', 'is_active'])]
class DiscountRule extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'spend_threshold' => 'decimal:2',
            'discount_percent' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
