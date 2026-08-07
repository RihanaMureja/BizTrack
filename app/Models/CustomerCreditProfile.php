<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'customer_id', 'suggested_credit_limit', 'owner_credit_limit_override', 'total_purchase_volume', 'on_time_payment_rate', 'average_order_value', 'customer_tenure_days', 'calculated_at'])]
class CustomerCreditProfile extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'suggested_credit_limit' => 'decimal:2',
            'owner_credit_limit_override' => 'decimal:2',
            'total_purchase_volume' => 'decimal:2',
            'on_time_payment_rate' => 'decimal:2',
            'average_order_value' => 'decimal:2',
            'customer_tenure_days' => 'integer',
            'calculated_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
