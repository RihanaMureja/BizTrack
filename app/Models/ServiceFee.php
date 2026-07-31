<?php

namespace App\Models;

use App\Enums\ServiceFeeStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'payment_id', 'service_fee_setting_id', 'fee_rate', 'payment_amount', 'fee_amount', 'status', 'description', 'paid_at', 'waived_at'])]
class ServiceFee extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'fee_rate' => 'decimal:2',
            'payment_amount' => 'decimal:2',
            'fee_amount' => 'decimal:2',
            'status' => ServiceFeeStatus::class,
            'paid_at' => 'datetime',
            'waived_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function setting(): BelongsTo
    {
        return $this->belongsTo(ServiceFeeSetting::class, 'service_fee_setting_id');
    }
}
