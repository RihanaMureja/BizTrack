// resources/js/data/landing-hero-slides.ts
export type LandingHeroSlide = {
    image: string;
    eyebrow: string;
    heading: string;
    description: string;
    textPosition: 'left' | 'right';
    features?: string[];
    badge?: string;
};

export const landingHeroSlides: LandingHeroSlide[] = [
    {
        image: '/brand/track business.png',
        eyebrow: 'All-in-One Business Platform',
        heading: 'Keep your business under control.',
        description: 'Sales, stock, and payments—connected.',
        textPosition: 'right',
        badge: 'All-in-One',
        features: ['Daily Operations', 'Inventory Tracking', 'Payments', 'Reports']
    },
    {
        image: '/brand/inventory.png',
        eyebrow: 'Smart Inventory Management',
        heading: 'Know what is in stock.',
        description: 'Track batches and expiry with clarity.',
        textPosition: 'left',
        badge: 'Smart Tracking',
        features: ['Batch Tracking', 'Expiry Alerts', 'Stock Movements', 'Product Control']
    },
    {
        image: '/brand/casher.png',
        eyebrow: 'Fast & Reliable Checkout',
        heading: 'Track every sale with confidence.',
        description: 'Fast checkout with clear records.',
        textPosition: 'right',
        badge: 'Fast Checkout',
        features: ['POS Checkout', 'Receipts', 'Discounts', 'Customer Credit']
    },
    {
        image: '/brand/cosmotics.jpg',
        eyebrow: 'Beauty & Cosmetics Retail',
        heading: 'Keep operations in control.',
        description: 'Built for product-based businesses.',
        textPosition: 'left',
        badge: 'Beauty-Ready',
        features: ['Inventory Control', 'Sales Records', 'Customer Data', 'Reports']
    },
    {
        image: '/brand/clothes store.jpg',
        eyebrow: 'Fashion & Apparel Stores',
        heading: 'Turn activity into better decisions.',
        description: 'See the business clearly, every day.',
        textPosition: 'right',
        badge: 'Retail-Ready',
        features: ['Catalog Management', 'Team Access', 'Sales Tracking', 'Reports']
    },
];
