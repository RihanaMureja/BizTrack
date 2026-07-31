<?php

namespace App\Models;

use App\Enums\BusinessVerificationDecision;
use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'reviewed_by', 'decision', 'reason', 'status_before', 'status_after', 'reviewed_at'])]
class BusinessVerificationReview extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'decision' => BusinessVerificationDecision::class,
            'status_before' => RecordStatus::class,
            'status_after' => RecordStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
