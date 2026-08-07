<?php

namespace App\Enums;

enum CustomerType: string
{
    case Individual = 'individual';
    case Company = 'company';
    case Government = 'government';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Individual => 'Individual',
            self::Company => 'Company',
            self::Government => 'Government office',
            self::Other => 'Other',
        };
    }
}
