<?php

namespace App\Enums;

enum CustomerType: string
{
    case Retail = 'retail';
    case Wholesale = 'wholesale';
    case Corporate = 'corporate';

    public function label(): string
    {
        return match ($this) {
            self::Retail => 'Retail',
            self::Wholesale => 'Wholesale',
            self::Corporate => 'Corporate',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
