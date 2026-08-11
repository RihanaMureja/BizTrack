import imageOne from '../../../assets/new images/5227a4b3c6c2999c5850c10dc9f39b8b.jpg';
import imageTwo from '../../../assets/new images/b3f3743f15d27aec911389d80c3a9c7c.jpg';
import imageThree from '../../../assets/new images/d432096c74d423af0a4732dce3107970.jpg';
import imageFour from '../../../assets/new images/dc387d79c00e592d6a54e0a64c51fc89.jpg';

export type LandingHeroSlide = {
    image: string;
    eyebrow: string;
    heading: string;
    description: string;
    cta: string;
};

export const landingHeroSlides: LandingHeroSlide[] = [
    {
        image: imageOne,
        eyebrow: 'Built for real business operations',
        heading: 'Run sales, stock, payments, and reports from one clean workspace.',
        description: 'BizTrack helps owners move from scattered notebooks into a daily operating system built for sales, inventory, teams, and decisions.',
        cta: 'Log in',
    },
    {
        image: imageTwo,
        eyebrow: 'Stock clarity without guesswork',
        heading: 'Know what is selling, what is stuck, and what needs restocking.',
        description: 'Products, categories, inventory batches, low-stock alerts, and stagnant product signals stay connected across the business.',
        cta: 'Open workspace',
    },
    {
        image: imageThree,
        eyebrow: 'Checkout and credit in one flow',
        heading: 'Keep every sale traceable from cart to receipt.',
        description: 'POS sales, customer credit, VAT, payments, receipts, and audit trails are recorded where the business actually works.',
        cta: 'Start selling',
    },
    {
        image: imageFour,
        eyebrow: 'Owner control with trusted employees',
        heading: 'Give every employee the exact access their work requires.',
        description: 'Business owners can shape roles, permissions, dashboards, reports, and workspace appearance around their own operation.',
        cta: 'Manage team',
    },
];
