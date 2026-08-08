<?php

namespace App\Enums;

enum BusinessType: string
{
    case GroceryStore = 'grocery_store';
    case ClothingStore = 'clothing_store';
    case Shoes = 'shoes';
    case Cosmetics = 'cosmetics';
    case Electronics = 'electronics';
    case Pharmacy = 'pharmacy';
    case Furniture = 'furniture';
    case HardwareBuildingMaterials = 'hardware_building_materials';
    case StationeryBookstore = 'stationery_bookstore';
    case AutoParts = 'auto_parts';
    case GeneralRetail = 'general_retail';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::GroceryStore => 'Grocery / Mini Market',
            self::ClothingStore => 'Clothing / Fashion',
            self::Shoes => 'Shoes',
            self::Cosmetics => 'Cosmetics / Beauty Products',
            self::Electronics => 'Electronics',
            self::Pharmacy => 'Pharmacy',
            self::Furniture => 'Furniture',
            self::HardwareBuildingMaterials => 'Hardware / Building Materials',
            self::StationeryBookstore => 'Stationery / Bookstore',
            self::AutoParts => 'Auto Parts',
            self::GeneralRetail => 'General Retail',
            self::Other => 'Other Product-Based Business',
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
