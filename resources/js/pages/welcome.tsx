import { Head, Link, usePage } from '@inertiajs/react';
import { AppearanceToggleButton } from '@/components/appearance-toggle-button';
import { PageBackgroundSlider } from '@/components/landing/page-background-slider';
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
} from 'lucide-react';
import { useState } from 'react';
import { dashboard, login } from '@/routes';

const highlights = [
    { label: 'POS sales', icon: ReceiptText },
    { label: 'Stock control', icon: Boxes },
    { label: 'Customer credit', icon: WalletCards },
    { label: 'Payment records', icon: CreditCard },
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

export default function Welcome() {
    const { auth } = usePage().props;
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const activeSlide = landingHeroSlides[activeSlideIndex] ?? landingHeroSlides[0];

    return (
        <>
            <Head title="Business Management Software" />
            <main className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
                <PageBackgroundSlider slides={landingHeroSlides} onSlideChange={setActiveSlideIndex} />

                <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/brand/biztrack-logo.jpg"
                            alt="BizTrack"
                            className="h-10 w-auto rounded-sm object-contain"
                        />
                    </Link>

                    <nav className="flex items-center gap-2">
                        <AppearanceToggleButton />
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="rounded-md bg-card/80 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur hover:bg-accent"
                            >
                                Log in
                            </Link>
                        )}
                    </nav>
                </header>

                <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-7xl flex-col justify-center px-5 py-10 lg:px-8">
                    <div className="max-w-4xl">
                        <div className="inline-flex w-fit items-center gap-2 rounded-md border bg-card/85 px-3 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
                            <ShieldCheck className="size-4 text-primary" />
                            {activeSlide.eyebrow}
                        </div>
                        <div key={activeSlide.image} className="landing-caption-swipe">
                            <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-normal md:text-5xl">
                                {activeSlide.heading}
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                                {activeSlide.description}
                            </p>
                        </div>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                            >
                                {auth.user ? 'Open dashboard' : activeSlide.cta}
                            </Link>
                        </div>

                        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
                            {highlights.map(({ label, icon: Icon }) => (
                                <div key={label} className="flex items-center gap-3 rounded-md border bg-card/85 p-3 shadow-sm backdrop-blur">
                                    <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                                        <Icon className="size-4" />
                                    </div>
                                    <span className="text-sm font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 lg:px-8">
                    <div className="rounded-md border bg-card/88 p-5 shadow-sm backdrop-blur md:p-6">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-primary">What BizTrack handles</p>
                                <h2 className="mt-2 text-2xl font-semibold">The important business work, connected.</h2>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                                <KeyRound className="size-4" />
                                Verified access and role-based permissions
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {features.map(({ title, description, icon: Icon }) => (
                                <div key={title} className="rounded-md border bg-background/78 p-4 backdrop-blur">
                                    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="mt-4 font-semibold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
