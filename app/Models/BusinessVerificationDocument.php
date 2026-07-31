<?php

namespace App\Models;

use App\Enums\BusinessVerificationDocumentType;
use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'uploaded_by', 'type', 'label', 'path', 'status', 'notes', 'reviewed_at', 'reviewed_by'])]
class BusinessVerificationDocument extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => BusinessVerificationDocumentType::class,
            'status' => RecordStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
