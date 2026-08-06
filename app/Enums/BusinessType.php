<?php

namespace App\Enums;

enum BusinessType: string
{
    case GroceryStore = 'grocery_store';
    case ClothingStore = 'clothing_store';
    case Cosmetics = 'cosmetics';
    case Electronics = 'electronics';
    case Restaurant = 'restaurant';
    case Pharmacy = 'pharmacy';
    case GeneralRetail = 'general_retail';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::GroceryStore => 'Grocery Store',
            self::ClothingStore => 'Clothing Store',
            self::Cosmetics => 'Cosmetics Store',
            self::Electronics => 'Electronics Store',
            self::Restaurant => 'Restaurant',
            self::Pharmacy => 'Pharmacy',
            self::GeneralRetail => 'General Retail',
            self::Other => 'Other',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
