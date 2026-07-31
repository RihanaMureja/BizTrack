<?php

namespace App\Enums;

enum ProductInsightType: string
{
    case Stagnant = 'stagnant';

    public function label(): string
    {
        return match ($this) {
            self::Stagnant => 'Stagnant product',
        };
    }
}
