<?php

namespace App\Models;

use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['owner_id', 'subscription_id', 'business_name', 'business_type', 'email', 'phone', 'address', 'logo', 'national_id_fan_number', 'national_id_photo_path', 'trade_license_path', 'tin_certificate_path', 'is_vat_registered', 'vat_certificate_path', 'has_physical_shop', 'rental_agreement_path', 'submitted_for_review_at', 'status'])]
class Business extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => RecordStatus::class,
            'is_vat_registered' => 'boolean',
            'has_physical_shop' => 'boolean',
            'submitted_for_review_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function expenseCategories(): HasMany
    {
        return $this->hasMany(ExpenseCategory::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
