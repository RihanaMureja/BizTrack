<?php

namespace App\Enums;

enum ContactMessageSource: string
{
    case Landing = 'landing';
    case OwnerSupport = 'owner_support';

    public function label(): string
    {
        return match ($this) {
            self::Landing => 'Landing page',
            self::OwnerSupport => 'Owner support',
        };
    }
}
