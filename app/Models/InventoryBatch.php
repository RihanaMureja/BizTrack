<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['product_id', 'business_id', 'batch_number', 'quantity_received', 'quantity_remaining', 'unit_cost', 'received_at', 'expiry_date'])]
class InventoryBatch extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'quantity_received' => 'integer',
            'quantity_remaining' => 'integer',
            'unit_cost' => 'decimal:2',
            'received_at' => 'datetime',
            'expiry_date' => 'date',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }
}
