<?php

namespace App\Models;

use App\Enums\CustomerType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['business_id', 'customer_type', 'display_name', 'full_name', 'contact_person', 'contact_person_phone', 'phone', 'email', 'address', 'credit_limit', 'current_balance'])]
class Customer extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'current_balance' => 'decimal:2',
            'customer_type' => CustomerType::class,
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function credits(): HasMany
    {
        return $this->hasMany(CustomerCredit::class);
    }

    public function creditProfile(): HasOne
    {
        return $this->hasOne(CustomerCreditProfile::class);
    }
}
