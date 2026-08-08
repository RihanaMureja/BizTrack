import {
    Armchair,
    BookOpen,
    Building2,
    Car,
    Footprints,
    Hammer,
    Pill,
    Shirt,
    ShoppingCart,
    Smartphone,
    Sparkles,
    Store,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type BusinessTypeOption = {
    value: string;
    label: string;
    description: string;
    icon: LucideIcon;
};

export const businessTypes: BusinessTypeOption[] = [
    {
        value: 'grocery_store',
        label: 'Grocery / Mini Market',
        description: 'Food, drinks, household essentials, and daily-use products.',
        icon: ShoppingCart,
    },
    {
        value: 'clothing_store',
        label: 'Clothing / Fashion',
        description: 'Apparel, fashion, and style products for every occasion.',
        icon: Shirt,
    },
    {
        value: 'shoes',
        label: 'Shoes',
        description: 'Footwear and shoe accessories for every occasion.',
        icon: Footprints,
    },
    {
        value: 'cosmetics',
        label: 'Cosmetics / Beauty Products',
        description: 'Beauty, skincare, haircare, and personal care products.',
        icon: Sparkles,
    },
    {
        value: 'electronics',
        label: 'Electronics',
        description: 'Phones, computers, gadgets, and home electronics.',
        icon: Smartphone,
    },
    {
        value: 'pharmacy',
        label: 'Pharmacy',
        description: 'Medicines, health, and wellness products.',
        icon: Pill,
    },
    {
        value: 'furniture',
        label: 'Furniture',
        description: 'Home and office furniture and furnishings.',
        icon: Armchair,
    },
    {
        value: 'hardware_building_materials',
        label: 'Hardware / Building Materials',
        description: 'Tools, construction materials, and hardware supplies.',
        icon: Hammer,
    },
    {
        value: 'stationery_bookstore',
        label: 'Stationery / Bookstore',
        description: 'Books, stationery, office supplies, and school items.',
        icon: BookOpen,
    },
    {
        value: 'auto_parts',
        label: 'Auto Parts',
        description: 'Vehicle parts, accessories, and maintenance products.',
        icon: Car,
    },
    {
        value: 'general_retail',
        label: 'General Retail',
        description: 'Mixed product categories and general merchandise retail.',
        icon: Store,
    },
    {
        value: 'other',
        label: 'Other Product-Based Business',
        description: 'A product-based business type not listed here.',
        icon: Building2,
    },
];

export function businessTypeLabel(value?: string | null): string {
    const known = businessTypes.find((type) => type.value === value);

    if (known) {
        return known.label;
    }

    return value ?? 'your business';
}
