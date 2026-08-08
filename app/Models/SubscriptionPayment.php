<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\SubscriptionPaymentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'subscription_id', 'user_id', 'amount', 'method', 'status', 'reference', 'checkout_url', 'chapa_response', 'paid_at', 'verified_at'])]
class SubscriptionPayment extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'method' => PaymentMethod::class,
            'status' => SubscriptionPaymentStatus::class,
            'amount' => 'decimal:2',
            'chapa_response' => 'array',
            'paid_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
