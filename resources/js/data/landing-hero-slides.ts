// resources/js/data/landing-hero-slides.ts
export type LandingHeroSlide = {
    image: string;
    eyebrow: string;
    heading: string;
    description: string;
    cta: string;
    textPosition: 'left' | 'right';
    features?: string[];
    badge?: string;
};

export const landingHeroSlides: LandingHeroSlide[] = [
    {
        image: '/brand/track%20business.jpg',
        eyebrow: 'All-in-One Business Platform',
        heading: 'Run your entire business from one connected workspace',
        description: 'Stop juggling scattered notebooks, Excel sheets, and loose papers. Manage every aspect—from sales to inventory to cash flow—in one integrated platform designed for small businesses.',
        cta: 'Start Free Today',
        textPosition: 'right',
        badge: 'All-in-One',
        features: ['Daily Operations', 'Multi-Location', 'Team Collaboration', 'Real-Time Sync']
    },
    {
        image: '/brand/inventory.jpg',
        eyebrow: 'Smart Inventory Management',
        heading: 'Know exactly what you have, where you have it',
        description: 'Track stock by batch and expiry date, get alerts before you run out, and eliminate dead stock. See your full inventory picture across all locations with zero guesswork.',
        cta: 'Organize Your Stock',
        textPosition: 'left',
        badge: 'Smart Tracking',
        features: ['Batch Tracking', 'Expiry Alerts', 'Stock Movements', 'Location Sync']
    },
    {
        image: '/brand/casher.jpg',
        eyebrow: 'Fast & Reliable Checkout',
        heading: 'Sell faster and never lose a transaction',
        description: 'Process sales in seconds with our intuitive POS. Print receipts, issue digital invoices, process discounts, and build customer credit records—all without a single paper receipt.',
        cta: 'Speed Up Sales',
        textPosition: 'right',
        badge: 'Fast Checkout',
        features: ['1-Click Checkout', 'Digital Receipts', 'Instant Reports', 'No Paper Needed']
    },
    {
        image: '/brand/cosmetics.jpg',
        eyebrow: 'Beauty & Cosmetics Retail',
        heading: 'Grow your cosmetics or beauty business with precision',
        description: 'Manage beauty products by shade, formula, and expiry. Track popular items, optimize pricing, and build a loyal customer base with smart transaction records and customer insights.',
        cta: 'Grow Your Beauty Brand',
        textPosition: 'left',
        badge: 'Beauty-Ready',
        features: ['Product Variants', 'Customer Loyalty', 'Trend Analysis', 'Growth Reports']
    },
    {
        image: '/brand/clothes%20%20store.jpg',
        eyebrow: 'Fashion & Apparel Stores',
        heading: 'Manage fashion retail with style and control',
        description: 'Track clothing by size, color, and style. Monitor seasonal trends, manage multiple locations, and empower your sales team with the data they need to sell smarter.',
        cta: 'Launch Your Store',
        textPosition: 'right',
        badge: 'Retail-Ready',
        features: ['Size & Color Tracking', 'Seasonal Reports', 'Team Control', 'Growth Insights']
    },
];
