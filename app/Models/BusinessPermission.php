<?php

namespace App\Models;

use App\Enums\BusinessPermissionKey;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['key', 'name', 'group', 'description'])]
class BusinessPermission extends Model
{
    use HasFactory;

    public function getNameAttribute(?string $value): ?string
    {
        return BusinessPermissionKey::tryFrom((string) ($this->attributes['key'] ?? ''))?->label() ?? $value;
    }

    public function getGroupAttribute(?string $value): ?string
    {
        return BusinessPermissionKey::tryFrom((string) ($this->attributes['key'] ?? ''))?->group() ?? $value;
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(BusinessRole::class)->withTimestamps();
    }
}
