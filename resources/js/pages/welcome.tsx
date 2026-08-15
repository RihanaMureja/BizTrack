import { Head, Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    CheckCircle2,
    ChevronDown,
    CircleDollarSign,
    LineChart,
    PackageSearch,
    ReceiptText,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImmersiveHeroSlider } from '@/components/landing/immersive-hero-slider';
import { PremiumHeader } from '@/components/landing/premium-header';
import { SiteFooter } from '@/components/landing/site-footer';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { landingHeroSlides } from '@/data/landing-hero-slides';
import { businessTypes } from '@/lib/business-types';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';

const realFeatures = [
    {
        title: 'Sales & POS',
        description: 'Record sales, discounts, receipts, payment methods, and customer credit from one flow.',
        icon: ReceiptText,
    },
    {
        title: 'Inventory',
        description: 'Track stock, batches, expiry dates, restocks, and product movement without spreadsheets.',
        icon: PackageSearch,
    },
    {
        title: 'Products & Categories',
        description: 'Organize your catalog, barcodes, pricing, and product records with clear structure.',
        icon: ShoppingBag,
    },
    {
        title: 'Customers & Credit',
        description: 'Keep customer records, balances, reminders, and credit workflows in one place.',
        icon: CircleDollarSign,
    },
    {
        title: 'Expenses & Reports',
        description: 'Capture expenses and review business performance through built-in reports.',
        icon: LineChart,
    },
    {
        title: 'Employees & Permissions',
        description: 'Manage cashiers, roles, permissions, and access control by responsibility.',
        icon: UsersRound,
    },
];

const roles = [
    {
        title: 'Business Owner',
        icon: Sparkles,
        points: [
            'Reviews dashboard insights and reports',
            'Manages business profile, inventory, and staff access',
            'Controls subscriptions and business settings',
        ],
    },
    {
        title: 'Cashier',
        icon: ReceiptText,
        points: [
            'Creates sales and processes payments',
            'Uses POS flow for daily checkout',
            'Works within assigned permissions',
        ],
    },
    {
        title: 'System Administrator',
        icon: ShieldCheck,
        points: [
            'Manages businesses, users, subscriptions, roles, and permissions',
            'Reviews audit logs and business verifications',
            'Oversees platform-level operations',
        ],
    },
];

const whyBizTrack = [
    'One source of truth for daily business operations',
    'Less manual work across sales, stock, and customer records',
    'Better visibility into what is happening inside the business',
    'Role-based control for owners, cashiers, and admins',
];

const pricingPlans = [
    {
        name: 'Free Trial',
        price: '0',
        billing: '30 days',
        description: 'Free access for the first 30 days so you can explore BizTrack with one cashier account.',
        features: ['1 cashier account', 'Basic reports and inventory', 'Email support'],
        highlight: false,
    },
    {
        name: 'Growth',
        price: '499',
        billing: 'per month',
        description: 'For growing businesses that need more cashier accounts and advanced reports.',
        features: ['5 cashier accounts', 'Unlimited products', 'Advanced reports', 'Priority support'],
        highlight: true,
    },
    {
        name: 'Pro',
        price: '999',
        billing: 'per month',
        description: 'For established teams that need larger staff capacity and the full BizTrack experience.',
        features: ['15 cashier accounts', 'Everything in Growth', 'Dedicated support', 'Team capacity'],
        highlight: false,
    },
];

const faqs = [
    {
        question: 'What is BizTrack?',
        answer: 'BizTrack is a business management platform for small and growing businesses. It helps organize sales, inventory, products, customers, payments, expenses, and reports.',
    },
    {
        question: 'Who is BizTrack for?',
        answer: 'It is built for product-based businesses such as grocery stores, clothing shops, cosmetics stores, electronics shops, pharmacies, and similar retail businesses.',
    },
    {
        question: 'Can I manage inventory and sales together?',
        answer: 'Yes. The current application includes sales, products, inventory, inventory batches, and stock movement workflows.',
    },
    {
        question: 'Can multiple employees use BizTrack?',
        answer: 'Yes. BizTrack includes cashier accounts, business roles, permissions, and staff management tools.',
    },
    {
        question: 'Can I control employee permissions?',
        answer: 'Yes. Role and permission management already exists for the business workspace.',
    },
    {
        question: 'Can I track expenses and profit?',
        answer: 'BizTrack includes expenses and reports, and the dashboard/reporting layers support business performance visibility.',
    },
    {
        question: 'Is there a free trial?',
        answer: 'Yes. The current subscription seeder includes a Free Trial plan that runs for 30 days.',
    },
    {
        question: 'Can I upgrade my plan later?',
        answer: 'Yes. The current subscription flow includes plan selection and payment-based activation for paid plans.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    useEffect(() => {
        const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.14, rootMargin: '0px 0px -6%' },
        );

        cards.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Head title="BizTrack - Business Management Software" />

            <main id="top" className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
                <PremiumHeader />

                <section data-header-theme="hero" className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 pt-24">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(52,211,153,0.18),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_28%)]" />
                    <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-8 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-12">
                        <div className="flex flex-col justify-center">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">
                                Business Management, Simplified
                            </div>
                            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Run your business smarter.
                                <span className="mt-2 block text-balance text-emerald-300">
                                    Track every sale, stock, and shilling.
                                </span>
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/80 sm:text-lg">
                                BizTrack helps small and growing businesses manage daily operations from one connected platform built for sales, inventory, customers, payments, and reporting.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                <Button
                                    asChild
                                    className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-950/30 hover:bg-emerald-300"
                                >
                                    <Link href={auth.user ? dashboard() : register()}>
                                        {auth.user ? 'Open Dashboard' : 'Get Started Free'}
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-full border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
                                >
                                    <a href="#about">Explore BizTrack</a>
                                </Button>
                            </div>

                            <p className="mt-4 text-sm text-emerald-50/60">
                                No complicated setup. Start managing your business in minutes.
                            </p>

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                {[
                                    'Inventory batches and expiry tracking',
                                    'Cashier roles and permissions',
                                    'Subscriptions and payment flow',
                                    'Audit logs and business settings',
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 shadow-sm backdrop-blur"
                                    >
                                        <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
                                        <span className="text-sm font-medium text-white/85">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative lg:py-4">
                            <div className="h-[72vh] min-h-[600px] max-h-[860px]">
                                <ImmersiveHeroSlider
                                    slides={landingHeroSlides}
                                    activeIndex={activeSlideIndex}
                                    onSlideChange={setActiveSlideIndex}
                                    className="h-full"
                                    intervalMs={2200}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" data-header-theme="light" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-5 lg:px-8">
                    <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                        <div data-reveal="left" className="max-w-xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">About BizTrack</p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Everything you need to manage a product-based business in one place.</h2>
                            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
                                <p>BizTrack is a business management platform designed to help small and growing product-based businesses manage daily operations with greater control and visibility.</p>
                                <p>From sales and inventory to expenses, customers, employees, payments, and business insights, BizTrack brings essential operations together in one connected platform.</p>
                            </div>
                            <div className="mt-7 flex flex-wrap items-center gap-4">
                                <Button asChild className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-transform hover:scale-[1.02] hover:bg-emerald-500"><Link href={register()}>Get started free</Link></Button>
                                <a href="#how-it-works" className="text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900 hover:underline hover:underline-offset-4">See how it works</a>
                            </div>
                        </div>

                        <div data-reveal="right" className="relative" role="img" aria-label="Illustrative BizTrack dashboard preview with sales, inventory, revenue, orders, expenses, and business insights">
                            <div aria-hidden="true" className="pointer-events-none absolute inset-x-12 -inset-y-8 rounded-full bg-emerald-300/20 blur-3xl" />
                            <div className="relative rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_28px_70px_-36px_rgba(15,23,42,0.42)] sm:p-5">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">B</div><div><p className="text-sm font-semibold text-slate-950">BizTrack overview</p><p className="text-xs text-slate-500">Demo workspace</p></div></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">This month</span></div>
                                <div className="mt-5 grid gap-3 sm:grid-cols-3">{[['Sales', 'ETB 24,800', 'text-emerald-700'], ['Inventory', '86% healthy', 'text-sky-700'], ['Expenses', 'ETB 4,250', 'text-amber-700']].map(([label, value, tone]) => <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">{label}</p><p className={`mt-2 text-sm font-semibold ${tone}`}>{value}</p></div>)}</div>
                                <div className="mt-4 grid gap-4 sm:grid-cols-[1.15fr_0.85fr]"><div className="rounded-xl border border-slate-100 p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Revenue overview</p><span className="text-xs text-emerald-700">+12.4%</span></div><div className="mt-5 flex h-24 items-end gap-2">{[38, 52, 45, 70, 58, 84, 76].map((height, index) => <div key={index} className="flex-1 rounded-t bg-emerald-500/80" style={{ height: `${height}%` }} />)}</div></div><div className="rounded-xl border border-slate-100 p-4"><p className="text-sm font-semibold text-slate-900">Recent orders</p><div className="mt-3 space-y-3">{['New order received', 'Payment received', 'Inventory updated'].map((item, index) => <div key={item} className="flex items-center gap-2"><span className={`size-2 rounded-full ${index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-sky-500' : 'bg-amber-500'}`} /><span className="text-xs text-slate-600">{item}</span></div>)}</div></div></div>
                                <div className="mt-4 rounded-xl bg-slate-950 p-4 text-white"><p className="text-xs text-white/60">Business insight</p><p className="mt-1 text-sm font-semibold">Stock levels are on track.</p></div>
                            </div>
                            <div aria-hidden="true" className="absolute -right-3 top-10 hidden rounded-xl border border-emerald-100 bg-white px-3 py-2 shadow-lg lg:block"><p className="text-xs font-semibold text-emerald-700">Monthly revenue</p><p className="mt-1 text-sm font-bold text-slate-950">ETB 24,800</p></div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                Built for product-based businesses
                            </p>
                            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                Built for the way modern product businesses operate
                            </h3>
                            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                                Whether you run a retail shop, clothing store, cosmetics business, electronics shop, hardware store, pharmacy, stationery business, or another product-based business, BizTrack helps you manage operations from one place.
                            </p>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {businessTypes
                                .filter((type) =>
                                    [
                                        'grocery_store',
                                        'clothing_store',
                                        'cosmetics',
                                        'electronics',
                                        'general_retail',
                                        'hardware_building_materials',
                                        'pharmacy',
                                        'stationery_bookstore',
                                    ].includes(type.value),
                                )
                                .map(({ label, description, icon: Icon }, index) => (
                                    <div
                                        key={label}
                                        data-reveal={index % 2 === 0 ? 'left' : 'right'}
                                        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:border-emerald-200 hover:shadow-md"
                                    >
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                                            <Icon className="size-5" />
                                        </div>
                                        <h3 className="mt-4 text-base font-semibold text-slate-950">{label}</h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </section>

                <section id="features" data-header-theme="light" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-5 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                Problem to solution
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                                Running a business should not mean running after spreadsheets.
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                BizTrack brings sales, stock, customer records, payments, expenses, and reporting together in one connected system for everyday business operations.
                            </p>

                            <div className="mt-6 space-y-3">
                                {[
                                    'Scattered stock information',
                                    'Hard-to-track sales and payments',
                                    'Manual reporting and unclear profit visibility',
                                    'Employee management spread across too many tools',
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                        <div className="size-2 rounded-full bg-rose-400" />
                                        <span className="text-sm text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {realFeatures.map(({ title, description, icon: Icon }, index) => (
                                <div
                                    key={title}
                                    data-reveal={index % 2 === 0 ? 'left' : 'right'}
                                    className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                                >
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="how-it-works" data-header-theme="light" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-5 lg:px-8">
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                How it works
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                                Get started in minutes.
                            </h2>
                        </div>

                        <div className="mt-8 grid gap-4 lg:grid-cols-4">
                            {[
                                {
                                    step: '01',
                                    title: 'Create your account',
                                    description: 'Register with the existing BizTrack sign-up flow.',
                                },
                                {
                                    step: '02',
                                    title: 'Set up your business',
                                    description: 'Add business details, logo, and profile information.',
                                },
                                {
                                    step: '03',
                                    title: 'Add products and start managing sales',
                                    description: 'Create products, organize categories, and start using POS.',
                                },
                                {
                                    step: '04',
                                    title: 'Track performance and make better decisions',
                                    description: 'Use dashboard, reports, and alerts to stay on top of the business.',
                                },
                            ].map((item, index) => (
                                <div
                                    key={item.step}
                                    data-reveal={index % 2 === 0 ? 'left' : 'right'}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md"
                                >
                                    <div className="inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                                        Step {item.step}
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="roles" data-header-theme="light" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-5 lg:px-8">
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                Roles
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                                One platform. Every role.
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                BizTrack already separates responsibilities for business owners, cashiers, and platform administrators.
                            </p>
                        </div>

                        <div className="mt-8 grid gap-5 lg:grid-cols-3">
                            {roles.map(({ title, icon: Icon, points }, index) => (
                                <div
                                    key={title}
                                    data-reveal={index % 2 === 0 ? 'left' : 'right'}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-md"
                                >
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                                    <ul className="mt-4 space-y-3">
                                        {points.map((point) => (
                                            <li key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="insights" data-header-theme="accent" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-5 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                Business insights
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                                Turn everyday transactions into business insight.
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                The dashboard and reporting layers already support revenue, expenses, profit visibility, and products sold.
                            </p>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                {[
                                    { label: 'Revenue', value: 'Demo preview' },
                                    { label: 'Expenses', value: 'Demo preview' },
                                    { label: 'Profit', value: 'Demo preview' },
                                    { label: 'Products sold', value: 'Demo preview' },
                                ].map((item, index) => (
                                    <div key={item.label} data-reveal={index % 2 === 0 ? 'left' : 'right'} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            {item.label}
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-slate-950">{item.value}</p>
                                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                                            <div className="h-2 w-3/5 rounded-full bg-emerald-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div id="inventory" className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-emerald-950 to-slate-950 p-8 text-white shadow-[0_20px_80px_-35px_rgba(2,6,23,0.6)]">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                                Inventory
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                                Never lose track of your stock.
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-white/75">
                                BizTrack already supports stock levels, low stock alerts, out-of-stock handling, reorder settings, fast-selling product visibility, batch tracking, and expiry dates.
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {[
                                    'Stock levels',
                                    'Low stock alerts',
                                    'Out of stock visibility',
                                    'Expiry-aware batches',
                                ].map((item) => (
                                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white/70">Fast-moving product</span>
                                    <BadgeCheck className="size-4 text-emerald-300" />
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-white/10">
                                    <div className="h-2 w-4/5 rounded-full bg-emerald-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section data-header-theme="light" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-5 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                Why BizTrack
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                                Built to help you make better business decisions.
                            </h2>
                            <div className="mt-6 grid gap-3">
                                {whyBizTrack.map((item) => (
                                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                        <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                                        <span className="text-sm font-medium text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div id="pricing" data-header-theme="dark" className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_20px_80px_-35px_rgba(2,6,23,0.7)]">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                                Pricing
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                                Choose the plan that fits your business.
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-white/75">
                                Pricing follows the current BizTrack subscription flow. Registration leads into the existing subscription selection and payment process.
                            </p>

                            <div className="mt-6 grid gap-4">
                                {pricingPlans.map((plan, index) => (
                                    <div
                                        key={plan.name}
                                        data-reveal={index % 2 === 0 ? 'left' : 'right'}
                                        className={cn(
                                            'rounded-2xl border p-5 transition-all',
                                            plan.highlight
                                                ? 'border-emerald-400/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                                                : 'border-white/10 bg-white/5',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">{plan.name}</h3>
                                                <p className="mt-1 text-sm text-white/70">{plan.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-semibold">ETB {plan.price}</div>
                                                <div className="text-xs uppercase tracking-[0.2em] text-white/60">{plan.billing}</div>
                                            </div>
                                        </div>
                                        <ul className="mt-4 grid gap-2 text-sm text-white/80 sm:grid-cols-2">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-center gap-2">
                                                    <CheckCircle2 className="size-4 text-emerald-300" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-5">
                                            <Button
                                                asChild
                                                className={cn(
                                                    'w-full rounded-full text-sm font-semibold',
                                                    plan.highlight
                                                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                                        : 'bg-white text-slate-950 hover:bg-white/90',
                                                )}
                                            >
                                                <Link href={register()}>Get Started</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq" data-header-theme="light" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-5 lg:px-8">
                    <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50/70 p-5 shadow-sm sm:p-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            FAQ
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                            Common questions about BizTrack.
                        </h2>

                        <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:gap-5">
                            {faqs.map((faq) => (
                                <Collapsible key={faq.question} className="group rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.28)] transition-[border-color,box-shadow] duration-300 hover:border-emerald-200 hover:shadow-[0_18px_38px_-26px_rgba(5,150,105,0.3)] sm:px-7 sm:py-6">
                                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-6 text-left" aria-label={faq.question}>
                                        <span className="text-base font-semibold leading-7 text-slate-950 sm:text-lg">{faq.question}</span>
                                        <ChevronDown className="size-5 shrink-0 text-emerald-600 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="overflow-hidden pt-4 text-sm leading-7 text-slate-600 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:text-base">
                                        {faq.answer}
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>
                    </div>
                </section>

                <section data-header-theme="dark" className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-5 lg:px-8">
                    <div className="rounded-[2rem] bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 px-6 py-10 text-white shadow-[0_30px_90px_-35px_rgba(2,6,23,0.8)] sm:px-10 sm:py-14">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Your business deserves better visibility.
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base">
                                Start managing your business with BizTrack using the same registration flow and product structure already present in the application.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button asChild className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-white/90">
                                <Link href={register()}>Get Started Free</Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
                                <a href="#top">Back to top</a>
                            </Button>
                        </div>
                    </div>
                </section>

                <SiteFooter />
            </main>
        </>
    );
}
