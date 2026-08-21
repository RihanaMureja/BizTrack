<?php

namespace App\Models;

use App\Enums\NotificationType;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['business_id', 'user_id', 'related_user_id', 'title', 'message', 'type', 'category', 'priority', 'action_url', 'dedupe_key', 'is_read', 'dismissed_at'])]
class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected function casts(): array
    {
        return [
            'type' => NotificationType::class,
            'category' => NotificationCategory::class,
            'priority' => NotificationPriority::class,
            'is_read' => 'boolean',
            'dismissed_at' => 'datetime',
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

    public function relatedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'related_user_id');
    }
}
