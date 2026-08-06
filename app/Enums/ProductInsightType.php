<?php

namespace App\Enums;

enum ProductInsightType: string
{
    case Stagnant = 'stagnant';
    case Expiring = 'expiring';

    public function label(): string
    {
        return match ($this) {
            self::Stagnant => 'Stagnant product',
            self::Expiring => 'Expiring soon',
        };
    }
}
