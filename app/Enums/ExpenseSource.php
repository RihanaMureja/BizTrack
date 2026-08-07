<?php

namespace App\Enums;

enum ExpenseSource: string
{
    case Manual = 'manual';
    case Restock = 'restock';
    case Payroll = 'payroll';

    public function label(): string
    {
        return match ($this) {
            self::Manual => 'Manual',
            self::Restock => 'Restock',
            self::Payroll => 'Payroll',
        };
    }
}
