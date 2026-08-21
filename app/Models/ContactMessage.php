<?php

namespace App\Models;

use App\Enums\ContactMessageSource;
use App\Enums\ContactMessageStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'user_id', 'full_name', 'email', 'phone', 'subject', 'message', 'source', 'status', 'ip_address', 'user_agent', 'read_at', 'resolved_at'])]
class ContactMessage extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'source' => ContactMessageSource::class,
            'status' => ContactMessageStatus::class,
            'read_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
