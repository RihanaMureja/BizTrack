<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'user_id', 'type', 'title', 'date_from', 'date_to', 'filters', 'summary', 'generated_at'])]
class Report extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'date_from' => 'date',
            'date_to' => 'date',
            'filters' => 'array',
            'summary' => 'array',
            'generated_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo { return $this->belongsTo(Business::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
