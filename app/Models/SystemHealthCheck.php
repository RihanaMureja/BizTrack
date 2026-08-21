<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['status', 'score', 'checks', 'incidents', 'checked_at'])]
class SystemHealthCheck extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'checks' => 'array',
            'incidents' => 'array',
            'checked_at' => 'datetime',
        ];
    }
}
