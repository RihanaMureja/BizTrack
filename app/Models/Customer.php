<?php

namespace App\Models;

use App\Enums\CustomerType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['business_id', 'full_name', 'customer_type', 'company_name', 'phone', 'email', 'address', 'credit_limit', 'default_discount', 'current_balance'])]
class Customer extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'customer_type' => CustomerType::class,
            'credit_limit' => 'decimal:2',
            'current_balance' => 'decimal:2',
            'default_discount' => 'decimal:2',
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
}
