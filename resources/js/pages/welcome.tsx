import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Boxes,
    CreditCard,
    ReceiptText,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';

const highlights = [
    {
        label: 'Revenue insights',
        description: 'Track sales and business performance at a glance.',
        icon: WalletCards,
    },
    {
        label: 'Smart inventory',
        description: 'Stay on top of stock with a clear inventory workflow.',
        icon: Boxes,
    },
    {
        label: 'Sales receipts',
        description: 'Keep checkout operations fast, simple, and organized.',
        icon: ReceiptText,
    },
    {
        label: 'Secure payments',
        description: 'Record payments and keep clean, organized records.',
        icon: CreditCard,
    },
];

const imageCards = [
    {
        src: '/brand/track business.jpg',
        alt: 'BizTrack revenue dashboard displaying business performance insights',
        heading: 'Revenue insights',
        text: 'Track revenue and business performance at a glance.',
        aspect: 'aspect-[4/3]',
        span: 'lg:col-span-2',
        spanSm: '',
        align: 'items-start justify-start',
        textAlign: 'text-left',
        motion: 'group-hover:translate-x-1',
        overlay: 'bg-gradient-to-b from-black/60 via-black/15 to-transparent',
    },
    {
        src: '/brand/casher.jpg',
        alt: 'BizTrack cashier interface for managing sales smoothly',
        heading: 'Sales receipts',
        text: 'Keep checkout operations fast, simple, and organized.',
        aspect: 'aspect-[4/3]',
        span: 'lg:col-span-2',
        spanSm: '',
        align: 'items-end justify-end',
        textAlign: 'text-right',
        motion: 'group-hover:-translate-y-1',
        overlay: 'bg-gradient-to-t from-black/60 via-black/15 to-transparent',
    },
    {
        src: '/brand/inventory.jpg',
        alt: 'BizTrack inventory dashboard for stock management',
        heading: 'Smart inventory',
        text: 'Stay on top of stock with a clear inventory workflow.',
        aspect: 'aspect-[4/3]',
        span: 'lg:col-span-2',
        spanSm: '',
        align: 'items-center justify-start',
        textAlign: 'text-left',
        motion: 'group-hover:-translate-x-1',
        overlay: 'bg-gradient-to-r from-black/60 via-black/15 to-transparent',
    },
    {
        src: '/brand/clothes  store.jpg',
        alt: 'BizTrack business reporting and analytics view',
        heading: 'Business reports',
        text: 'Review business reports with a clean, professional dashboard.',
        aspect: 'aspect-[16/9]',
        span: 'lg:col-span-3',
        spanSm: '',
        align: 'items-start justify-end',
        textAlign: 'text-right',
        motion: 'group-hover:translate-y-1',
        overlay: 'bg-gradient-to-b from-black/60 via-black/15 to-transparent',
    },
    {
        src: '/brand/cosmetics.jpg',
        alt: 'BizTrack all-in-one business management platform overview',
        heading: 'One workspace',
        text: 'Run your daily business operations from one place.',
        aspect: 'aspect-[16/9]',
        span: 'lg:col-span-3',
        spanSm: 'sm:col-span-2',
        align: 'items-end justify-start',
        textAlign: 'text-left',
        motion: 'group-hover:scale-[1.015]',
        overlay: 'bg-gradient-to-t from-black/60 via-black/15 to-transparent',
    },
];

const revealDelays = [
    'delay-0',
    'delay-100',
    'delay-200',
    'delay-300',
    'delay-400',
];

function Reveal({
    children,
    className,
    delayClass = 'delay-0',
}: {
    children: ReactNode;
    className?: string;
    delayClass?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(
        () =>
            typeof window === 'undefined' ||
            typeof window.IntersectionObserver === 'undefined',
    );

    useEffect(() => {
        const node = ref.current;

        if (!node || isVisible) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '0px 0px -48px 0px', threshold: 0.15 },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [isVisible]);

    return (
        <div
            ref={ref}
            className={cn(
                'will-change-[opacity,transform]',
                isVisible
                    ? cn(
                          'animate-in ease-out animation-duration-700 fade-in-0 fill-mode-both slide-in-from-bottom-3',
                          delayClass,
                      )
                    : 'opacity-0',
                className,
            )}
        >
            {children}
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage().props;
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setIsHeaderSticky(window.scrollY > 20);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title="Track. Manage. Grow." />

            {/* Hero - Dark BizTrack green with background image */}
            <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,oklch(0.22_0.07_153)_0%,oklch(0.34_0.12_153)_55%,oklch(0.48_0.15_153)_100%)]">
                {/* ✅ Background Image - Added BizTrack hero background */}
                <div className="absolute inset-0 bg-[url('/brand/hero-bg.png')] bg-cover bg-center opacity-20" />
                
                {/* Subtle background glow */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-32 right-[-12%] h-[30rem] w-[30rem] rounded-full bg-brand-primary-light/10 blur-3xl"
                />

                {/* Header - Logo | Navigation | Login */}
                <header
                    className={`sticky top-0 z-50 mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 transition-all duration-300 sm:px-5 sm:py-5 lg:px-8 ${
                        isHeaderSticky
                            ? 'bg-black/20 shadow-sm backdrop-blur-xl'
                            : ''
                    }`}
                >
                    <Link
                        href="/"
                        className="justify-self-start transition-opacity hover:opacity-80"
                    >
                        <img
                            src="/brand/logo.png"
                            alt="BizTrack - Business Management Platform"
                            className="h-10 w-auto rounded-sm object-contain brightness-0 invert sm:h-12"
                        />
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        <a
                            href="#showcase"
                            className="text-sm font-medium text-white/75 transition-colors duration-200 hover:text-white"
                        >
                            Business Types
                        </a>
                        <a
                            href="#features"
                            className="text-sm font-medium text-white/75 transition-colors duration-200 hover:text-white"
                        >
                            Features
                        </a>
                    </nav>

                    <div className="justify-self-end">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[oklch(0.28_0.1_153)] shadow-lg transition-all duration-200 hover:bg-white/90 hover:shadow-xl"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 sm:px-5 sm:py-2.5"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </header>

                {/* Hero content */}
                <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-20 pb-24 text-center sm:px-5 sm:pt-28 sm:pb-32">
                    <div className="animate-in delay-100 ease-out animation-duration-700 fade-in-0 fill-mode-both slide-in-from-bottom-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                            <ShieldCheck className="size-4 text-brand-primary-light" />
                            <span>Built for small business control</span>
                        </div>
                    </div>

                    <h1 className="animate-in text-4xl leading-[1.1] font-bold tracking-tight text-white delay-200 ease-out animation-duration-700 fade-in-0 fill-mode-both slide-in-from-bottom-3 sm:text-5xl md:text-6xl">
                        Run your business with clarity, confidence, and{' '}
                        <span className="bg-gradient-to-r from-brand-primary-light to-white bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                            clean records.
                        </span>
                    </h1>

                    <p className="max-w-xl animate-in text-lg leading-relaxed text-white/80 delay-300 ease-out animation-duration-700 fade-in-0 fill-mode-both slide-in-from-bottom-3 sm:text-xl">
                        BizTrack gives business owners and cashiers one simple
                        workspace to manage sales, inventory, payments,
                        customers, subscriptions, and reports.
                    </p>

                    <div className="animate-in delay-500 ease-out animation-duration-700 fade-in-0 fill-mode-both slide-in-from-bottom-3">
                        <Button
                            asChild
                            size="lg"
                            className="h-12 rounded-full bg-white px-8 text-base font-semibold text-[oklch(0.28_0.1_153)] shadow-lg shadow-black/20 transition-all duration-200 hover:bg-white/90 hover:shadow-xl sm:px-10"
                        >
                            <Link href={register()}>
                                Get started
                                <ArrowRight className="ml-2 size-4.5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Product showcase - existing BizTrack screens as image cards */}
            <section
                id="showcase"
                className="relative scroll-mt-24 bg-background"
            >
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8">
                    <Reveal className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
                            Inside BizTrack
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            A workspace built for daily business operations
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                            Explore BizTrack's key screens — from the checkout
                            counter to business reports.
                        </p>
                    </Reveal>

                    <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
                        {imageCards.map((card, index) => (
                            <Reveal
                                key={card.src}
                                delayClass={revealDelays[index]}
                                className={cn('h-full', card.spanSm, card.span)}
                            >
                                <div
                                    className={cn(
                                        'group relative w-full overflow-hidden rounded-2xl border border-black/10 shadow-lg shadow-black/10 dark:border-white/10 dark:shadow-black/40',
                                        card.aspect,
                                    )}
                                >
                                    <img
                                        src={card.src}
                                        alt={card.alt}
                                        loading={index < 2 ? 'eager' : 'lazy'}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out will-change-transform group-hover:scale-[1.05]"
                                    />

                                    {/* Readability overlay, keeps the image visible */}
                                    <div
                                        aria-hidden="true"
                                        className={cn(
                                            'absolute inset-0 transition-opacity duration-500',
                                            card.overlay,
                                        )}
                                    />

                                    <div
                                        className={cn(
                                            'pointer-events-none absolute inset-0 z-10 flex flex-col p-5 sm:p-6',
                                            card.align,
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'max-w-md transition-transform duration-500 ease-out',
                                                card.textAlign,
                                                card.motion,
                                            )}
                                        >
                                            <h3 className="text-lg font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] sm:text-xl">
                                                {card.heading}
                                            </h3>
                                            <p className="mt-1 text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                                                {card.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features - existing BizTrack capabilities */}
            <section
                id="features"
                className="relative scroll-mt-24 bg-background"
            >
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8">
                    <Reveal className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
                            Features
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Everything you need to run your business
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                            Sales, inventory, payments, customers, and reports —
                            managed from one clean workspace.
                        </p>
                    </Reveal>

                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {highlights.map(
                            ({ label, description, icon: Icon }, index) => (
                                <Reveal
                                    key={label}
                                    delayClass={revealDelays[index]}
                                    className="h-full"
                                >
                                    <div className="group flex h-full flex-col rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                                            <Icon className="size-7 stroke-[1.75]" />
                                        </div>
                                        <h3 className="mt-6 text-lg font-semibold text-foreground">
                                            {label}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {description}
                                        </p>
                                    </div>
                                </Reveal>
                            ),
                        )}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative overflow-hidden bg-[oklch(0.28_0.1_153)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)]"
                />

                <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-5 lg:px-8">
                    <Reveal>
                        <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Ready to take control of your business?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80">
                            Create your account and start keeping clean records
                            today.
                        </p>
                        <div className="mt-10">
                            <Button
                                asChild
                                size="lg"
                                className="h-12 rounded-full bg-white px-8 text-base font-semibold text-[oklch(0.28_0.1_153)] shadow-lg shadow-black/20 transition-all duration-200 hover:bg-white/90 hover:shadow-xl sm:px-10"
                            >
                                <Link href={register()}>
                                    Get started
                                    <ArrowRight className="ml-2 size-4.5" />
                                </Link>
                            </Button>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    );
}