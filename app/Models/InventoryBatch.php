<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['inventory_id', 'product_id', 'business_id', 'user_id', 'batch_number', 'quantity', 'remaining_quantity', 'unit_cost', 'received_at', 'expires_at', 'notes'])]
class InventoryBatch extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'remaining_quantity' => 'integer',
            'unit_cost' => 'decimal:2',
            'received_at' => 'datetime',
            'expires_at' => 'date',
        ];
    }

    /**
     * Build the next unique batch number using the BATCH-YYYYMMDD-NNN format.
     */
    public static function generateBatchNumber(?CarbonInterface $at = null): string
    {
        $prefix = 'BATCH-'.($at ?? now())->format('Ymd');
        $sequence = 0;

        do {
            $sequence++;
            $batchNumber = $prefix.'-'.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
        } while (static::query()->where('batch_number', $batchNumber)->exists());

        return $batchNumber;
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
