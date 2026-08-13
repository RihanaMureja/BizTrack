// resources/js/pages/welcome.tsx - Simplified version without Clock icon
import { Head, Link, usePage } from '@inertiajs/react';
import { ImmersiveHeroSlider } from '@/components/landing/immersive-hero-slider';
import { PremiumHeader } from '@/components/landing/premium-header';
import { landingHeroSlides } from '@/data/landing-hero-slides';
import {
    Boxes,
    CreditCard,
    KeyRound,
    ReceiptText,
    ScrollText,
    ShieldCheck,
    UsersRound,
    WalletCards,
    ArrowRight,
    CheckCircle,
    Building2,
    Settings2,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard, login, register } from '@/routes';

const highlights = [
    { label: 'POS Sales', icon: ReceiptText },
    { label: 'Stock Control', icon: Boxes },
    { label: 'Customer Credit', icon: WalletCards },
    { label: 'Payment Records', icon: CreditCard },
];

const features = [
    {
        title: 'Sell with control',
        description: 'Record sales, payments, discounts, and customer credit without scattered notebooks.',
        icon: ReceiptText,
    },
    {
        title: 'Know your stock',
        description: 'Track products, available stock, low-stock items, and slow-moving inventory.',
        icon: Boxes,
    },
    {
        title: 'Manage your team',
        description: 'Give employees only the permissions they need for their daily work.',
        icon: UsersRound,
    },
    {
        title: 'Stay verified',
        description: 'Business documents, subscriptions, audit logs, and reports stay organized.',
        icon: ScrollText,
    },
];

const setupSteps = [
    {
        icon: Building2,
        title: 'Set up your business',
        description: 'Add your business details, store locations, and customize your workspace in minutes.',
        time: '~5 min',
    },
    {
        icon: Settings2,
        title: 'Add products & inventory',
        description: 'Import your products, set stock levels, and organize categories with ease.',
        time: '~10 min',
    },
    {
        icon: Sparkles,
        title: 'Start selling & tracking',
        description: 'Begin processing sales, tracking inventory, and viewing reports instantly.',
        time: '~2 min',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    return (
        <>
            <Head title="BizTrack - Business Management Software" />
            <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
                <PremiumHeader />

                {/* Hero Section */}
                <section className="relative">
                    <div className="h-[90vh] min-h-[600px] max-h-[950px]">
                        <ImmersiveHeroSlider
                            slides={landingHeroSlides}
                            activeIndex={activeSlideIndex}
                            onSlideChange={setActiveSlideIndex}
                            className="h-full"
                            intervalMs={2000}
                        />
                    </div>
                </section>

                {/* Highlights */}
                <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-0 lg:px-8">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {highlights.map(({ label, icon: Icon }) => (
                            <div
                                key={label}
                                className="group flex items-center gap-3 rounded-xl bg-card/95 p-4 shadow-lg backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-xl border border-border/50"
                            >
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon className="size-4" />
                                </div>
                                <span className="text-sm font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3-Step Setup */}
                <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-12 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                            <CheckCircle className="size-4" />
                            Simple Setup
                        </div>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                            Get started in 3 easy steps
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            Launch your BizTrack workspace and start managing your business in minutes.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {setupSteps.map((step, index) => (
                            <div
                                key={index}
                                className="group relative rounded-2xl bg-card/95 p-8 shadow-lg backdrop-blur transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-2 border border-border/50"
                            >
                                <div className="absolute -top-3 -right-3 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30">
                                    {index + 1}
                                </div>

                                <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                                    <step.icon className="size-7" />
                                </div>

                                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {step.description}
                                </p>

                                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {step.time}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link
                            href={auth.user ? dashboard() : register()}
                            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:shadow-primary/40 hover:scale-105 active:scale-95"
                        >
                            {auth.user ? 'Open Dashboard' : 'Start Your Free Trial'}
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <p className="mt-3 text-xs text-muted-foreground">
                            No credit card required. Free 14-day trial.
                        </p>
                    </div>
                </section>

                {/* Features */}
                <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 lg:px-8">
                    <div className="rounded-2xl bg-card/95 p-6 shadow-xl backdrop-blur transition-all hover:shadow-2xl border border-border/50 md:p-8">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-5 text-primary" />
                                    <p className="text-sm font-medium text-primary">What BizTrack handles</p>
                                </div>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                    The important business work, connected.
                                </h2>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                                <KeyRound className="size-4" />
                                Verified access and role-based permissions
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {features.map(({ title, description, icon: Icon }) => (
                                <div
                                    key={title}
                                    className="group rounded-xl bg-background/80 p-5 backdrop-blur transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 border border-border/50"
                                >
                                    <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="mt-4 font-semibold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer CTA */}
                <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 lg:px-8">
                    <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-8 text-center backdrop-blur border border-primary/20 md:p-12">
                        <h3 className="text-2xl font-bold md:text-3xl">
                            Ready to transform your business?
                        </h3>
                        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                            Join thousands of businesses already using BizTrack to manage sales, inventory, and teams.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href={auth.user ? dashboard() : register()}
                                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/40 hover:scale-105 active:scale-95"
                            >
                                Get Started Now
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="#features"
                                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-all hover:bg-white/20 border border-border/50"
                            >
                                View Features
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
