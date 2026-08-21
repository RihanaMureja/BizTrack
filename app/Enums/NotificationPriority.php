<?php

namespace App\Enums;

enum NotificationPriority: string
{
    case Critical = 'critical';
    case High = 'high';
    case Normal = 'normal';

    public function label(): string
    {
        return match ($this) {
            self::Critical => 'Critical',
            self::High => 'High',
            self::Normal => 'Normal',
        };
    }
}
