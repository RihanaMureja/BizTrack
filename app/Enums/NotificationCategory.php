<?php

namespace App\Enums;

enum NotificationCategory: string
{
    case Business = 'businesses';
    case Subscription = 'subscriptions';
    case Payment = 'payments';
    case Security = 'security';
    case System = 'system';
    case Support = 'support';

    public function label(): string
    {
        return match ($this) {
            self::Business => 'Businesses',
            self::Subscription => 'Subscriptions',
            self::Payment => 'Payments',
            self::Security => 'Security',
            self::System => 'System',
            self::Support => 'Support',
        };
    }
}
