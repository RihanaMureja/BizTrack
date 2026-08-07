<?php

namespace App\Enums;

enum BusinessAccessMode: string
{
    case Onboarding = 'onboarding';
    case Trial = 'trial';
    case Active = 'active';
    case Suspended = 'suspended';

    public function label(): string
    {
        return str($this->value)->replace('_', ' ')->title()->toString();
    }
}
