<?php

namespace App\Enums;

enum NotificationType: string
{
    case LowStock = 'low_stock';
    case PaymentReceived = 'payment_received';
    case CreditReminder = 'credit_reminder';
    case DailySales = 'daily_sales';
    case BusinessApproved = 'business_approved';
    case StagnantProduct = 'stagnant_product';
    case ExpiringProduct = 'expiring_product';

    public function label(): string
    {
        return match ($this) {
            self::LowStock => 'Low stock',
            self::PaymentReceived => 'Payment received',
            self::CreditReminder => 'Credit reminder',
            self::DailySales => 'Daily sales',
            self::BusinessApproved => 'Business approved',
            self::StagnantProduct => 'Stagnant product',
            self::ExpiringProduct => 'Expiring product',
        };
    }
}
