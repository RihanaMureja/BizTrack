<?php

namespace App\Models;

use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'price', 'duration_months', 'duration_days', 'max_cashiers', 'description', 'features', 'status'])]
class Subscription extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'status' => RecordStatus::class,
            'features' => 'array',
        ];
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class);
    }
}
