<?php

namespace App\Enums;

enum ProductInsightStatus: string
{
    case Open = 'open';
    case Dismissed = 'dismissed';
    case Resolved = 'resolved';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Open',
            self::Dismissed => 'Dismissed',
            self::Resolved => 'Resolved',
        };
    }
}
