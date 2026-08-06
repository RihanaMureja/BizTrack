import {
    Building2,
    Pill,
    Shirt,
    ShoppingCart,
    Smartphone,
    Sparkles,
    Store,
    Utensils,
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
        label: 'Grocery Store',
        description: 'Fresh produce, packaged goods, and daily essentials.',
        icon: ShoppingCart,
    },
    {
        value: 'clothing_store',
        label: 'Clothing Store',
        description: 'Apparel, footwear, and fashion accessories.',
        icon: Shirt,
    },
    {
        value: 'cosmetics',
        label: 'Cosmetics Store',
        description: 'Beauty, skincare, and personal care products.',
        icon: Sparkles,
    },
    {
        value: 'electronics',
        label: 'Electronics Store',
        description: 'Gadgets, phones, and home appliances.',
        icon: Smartphone,
    },
    {
        value: 'restaurant',
        label: 'Restaurant',
        description: 'Food service, dine-in, and takeaway.',
        icon: Utensils,
    },
    {
        value: 'pharmacy',
        label: 'Pharmacy',
        description: 'Medicines, health, and wellness products.',
        icon: Pill,
    },
    {
        value: 'general_retail',
        label: 'General Retail',
        description: 'Mixed goods and multi-category retail.',
        icon: Store,
    },
    {
        value: 'other',
        label: 'Other',
        description: 'A business type not listed here.',
        icon: Building2,
    },
];

export function businessTypeLabel(value?: string | null): string {
    return businessTypes.find((type) => type.value === value)?.label ?? 'your business';
}
