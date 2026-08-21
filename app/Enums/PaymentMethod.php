<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case Bank = 'bank';
    case Telebirr = 'telebirr';
    case Mpesa = 'mpesa';
    case CbeBirr = 'cbebirr';
    case Apollo = 'apollo';
    case Chapa = 'chapa';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash',
            self::Bank => 'Bank transfer',
            self::Telebirr => 'Telebirr',
            self::Mpesa => 'M-Pesa',
            self::CbeBirr => 'CBE Birr',
            self::Apollo => 'Apollo',
            self::Chapa => 'Chapa',
        };
    }
}
