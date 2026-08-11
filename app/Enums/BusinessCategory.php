<?php

namespace App\Enums;

enum BusinessCategory: string
{
    case RetailShop = 'retail_shop';
    case Supermarket = 'supermarket';
    case Pharmacy = 'pharmacy';
    case Boutique = 'boutique';
    case Restaurant = 'restaurant';
    case Electronics = 'electronics';
    case Cosmetics = 'cosmetics';
    case Wholesale = 'wholesale';
    case ServiceBusiness = 'service_business';
    case OnlineStore = 'online_store';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::RetailShop => 'Retail shop',
            self::Supermarket => 'Supermarket',
            self::Pharmacy => 'Pharmacy',
            self::Boutique => 'Boutique',
            self::Restaurant => 'Restaurant',
            self::Electronics => 'Electronics',
            self::Cosmetics => 'Cosmetics',
            self::Wholesale => 'Wholesale',
            self::ServiceBusiness => 'Service business',
            self::OnlineStore => 'Online store',
            self::Other => 'Other',
        };
    }
}
