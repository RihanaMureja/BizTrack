<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case Bank = 'bank';
    case Telebirr = 'telebirr';
    case Chapa = 'chapa';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash',
            self::Bank => 'Bank transfer',
            self::Telebirr => 'Telebirr',
            self::Chapa => 'Chapa',
        };
    }
}
