<?php

namespace App\Models;

use App\Enums\ProductInsightStatus;
use App\Enums\ProductInsightType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'product_id', 'type', 'status', 'days_without_sale', 'threshold_days', 'stock_on_hand', 'last_sold_at', 'detected_at', 'notified_at', 'dismissed_at', 'resolved_at', 'suggested_action'])]
class ProductMovementInsight extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => ProductInsightType::class,
            'status' => ProductInsightStatus::class,
            'days_without_sale' => 'integer',
            'threshold_days' => 'integer',
            'stock_on_hand' => 'integer',
            'last_sold_at' => 'datetime',
            'detected_at' => 'datetime',
            'notified_at' => 'datetime',
            'dismissed_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
