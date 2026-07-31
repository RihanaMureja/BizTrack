<?php

namespace App\Enums;

enum ServiceFeeStatus: string
{
    case Unpaid = 'unpaid';
    case Paid = 'paid';
    case Waived = 'waived';

    public function label(): string
    {
        return match ($this) {
            self::Unpaid => 'Unpaid',
            self::Paid => 'Paid',
            self::Waived => 'Waived',
        };
    }
}
