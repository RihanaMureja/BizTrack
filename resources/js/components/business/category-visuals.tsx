import { Boxes, Brush, Gem, Pill, Shirt, ShoppingBasket, Smartphone, Sparkles, SprayCan, Store, Utensils } from 'lucide-react';

export type BusinessVisualCategoryKey =
    | 'retail_shop'
    | 'supermarket'
    | 'pharmacy'
    | 'boutique'
    | 'restaurant'
    | 'electronics'
    | 'cosmetics'
    | 'wholesale'
    | 'service_business'
    | 'online_store'
    | 'other';

export type BusinessVisualCategory = BusinessVisualCategoryKey | null | undefined;

export function visualForBusinessCategory(category: string | null | undefined) {
    const visuals = {
        retail_shop: {
            label: 'Retail',
            Icon: ShoppingBasket,
            className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
        },
        supermarket: {
            label: 'Supermarket',
            Icon: Store,
            className: 'bg-lime-50 text-lime-700 dark:bg-lime-500/15 dark:text-lime-200',
        },
        pharmacy: {
            label: 'Pharmacy',
            Icon: Pill,
            className: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200',
        },
        boutique: {
            label: 'Boutique',
            Icon: Shirt,
            className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200',
        },
        restaurant: {
            label: 'Restaurant',
            Icon: Utensils,
            className: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200',
        },
        electronics: {
            label: 'Electronics',
            Icon: Smartphone,
            className: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
        },
        cosmetics: {
            label: 'Cosmetics',
            Icon: Brush,
            className: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-200',
        },
        wholesale: {
            label: 'Wholesale',
            Icon: Boxes,
            className: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200',
        },
        service_business: {
            label: 'Service',
            Icon: Sparkles,
            className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
        },
        online_store: {
            label: 'Online',
            Icon: Gem,
            className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
        },
        other: {
            label: 'Product',
            Icon: SprayCan,
            className: 'bg-primary/10 text-primary',
        },
    };

    return visuals[(category ?? 'other') as BusinessVisualCategoryKey] ?? visuals.other;
}
