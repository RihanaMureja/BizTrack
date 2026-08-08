import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Boxes, CreditCard, ReceiptText, ShieldCheck, WalletCards } from 'lucide-react';

import { dashboard, login } from '@/routes';

const SLIDE_DURATION = 3000;
const TRANSITION_DURATION = 700;

const highlights = [
    { label: 'Revenue insights', icon: WalletCards },
    { label: 'Smart inventory', icon: Boxes },
    { label: 'Sales receipts', icon: ReceiptText },
    { label: 'Secure payments', icon: CreditCard },
];

const showcaseImages = [
    {
        src: '/brand/track business.jpg',
        alt: 'BizTrack revenue dashboard displaying business performance insights',
    },
    {
        src: '/brand/casher.jpg',
        alt: 'BizTrack cashier interface for managing sales smoothly',
    },
    {
        src: '/brand/inventory.jpg',
        alt: 'BizTrack inventory dashboard for stock management',
    },
    {
        src: '/brand/clothes  store.jpg',
        alt: 'BizTrack business reporting and analytics view',
    },
    {
        src: '/brand/cosmetics.jpg',
        alt: 'BizTrack all-in-one business management platform overview',
    },
];

const imageCaptions = [
    'Track revenue and business performance at a glance.',
    'Keep checkout operations fast, simple, and organized.',
    'Stay on top of stock with a clear inventory workflow.',
    'Review business reports with a clean, professional dashboard.',
    'Run your daily business operations from one place.',
];

export default function Welcome() {
    const { auth } = usePage().props;
    const [activeImage, setActiveImage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);
    const [isHoveringImage, setIsHoveringImage] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
    }, []);

    const startAutoSlideshow = useCallback(() => {
        clearTimers();
        if (isPaused) return;

        intervalRef.current = setInterval(() => {
            setIsTransitioning((current) => {
                if (current) return current;

                setActiveImage((prev) => (prev + 1) % showcaseImages.length);
                transitionTimeoutRef.current = setTimeout(() => {
                    setIsTransitioning(false);
                }, TRANSITION_DURATION);

                return true;
            });
        }, SLIDE_DURATION);
    }, [clearTimers, isPaused]);

    const goToImage = useCallback(
        (index: number) => {
            if (isTransitioning || index === activeImage) return;

            setIsTransitioning(true);
            setActiveImage(index);

            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }

            transitionTimeoutRef.current = setTimeout(() => {
                setIsTransitioning(false);
            }, TRANSITION_DURATION);

            startAutoSlideshow();
        },
        [activeImage, isTransitioning, startAutoSlideshow],
    );

    const handleThumbnailClick = useCallback(
        (index: number) => {
            goToImage(index);
        },
        [goToImage],
    );

    const handleMouseEnter = useCallback(() => {
        setIsPaused(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsPaused(false);
    }, []);

    useEffect(() => {
        startAutoSlideshow();
        return clearTimers;
    }, [clearTimers, startAutoSlideshow]);

    useEffect(() => {
        if (isPaused) {
            clearTimers();
            return;
        }
        startAutoSlideshow();
    }, [clearTimers, isPaused, startAutoSlideshow]);

    useEffect(() => {
        const onScroll = () => {
            setIsHeaderSticky(window.scrollY > 20);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const activeCaption = useMemo(() => imageCaptions[activeImage], [activeImage]);

    return (
        <>
            <Head title="Track. Manage. Grow." />

            {/* UPDATED: Added the background image and adjusted overlay handling */}
            <main className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 text-foreground relative bg-[url('/brand/hero-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/75 before:via-black/70 before:to-black/85 before:z-0">
                
                {/* We added a wrapper div to keep your existing content above the background overlay */}
                <div className="relative z-10">
                    <header
                        className={`sticky top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between border-b border-border/30 px-4 py-4 sm:px-5 sm:py-5 lg:px-8 transition-all duration-300 ${
                            isHeaderSticky
                                ? 'bg-background/85 backdrop-blur-md shadow-sm'
                                : 'bg-background/60 backdrop-blur-sm'
                        }`}
                    >
                        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                            <img
                                src="/brand/biztrack-logo.jpg"
                                alt="BizTrack - Business Management Platform"
                                className="h-10 w-auto rounded-sm object-contain sm:h-12"
                            />
                        </Link>

                        <nav className="flex items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 sm:px-5 sm:py-2.5"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="rounded-md px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-accent hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 sm:px-5 sm:py-2.5"
                                >
                                    Log in
                                </Link>
                            )}
                        </nav>
                    </header>

                    <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:gap-10 sm:px-5 sm:py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
                        <div className="flex flex-col justify-center space-y-6 sm:space-y-7 md:space-y-8 lg:space-y-9">
                            {/* Enhanced Badge with professional styling */}
                            <div className="group relative inline-flex w-fit items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] sm:px-5 sm:py-2.5">
                                {/* Subtle animated background glow */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                
                                {/* Icon with pulse animation on hover */}
                                <div className="relative">
                                    <ShieldCheck className="size-4 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg] sm:size-4.5" />
                                    {/* Subtle dot indicator */}
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                                    </span>
                                </div>
                                
                                <span className="relative font-medium tracking-wide">
                                    Built for small business control
                                </span>
                                
                                {/* Decorative shine effect on hover */}
                                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                </div>
                            </div>

                            <h1 className="max-w-4xl text-3xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                                Run your business with clarity, confidence, and{' '}
                                <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                                    clean records.
                                </span>
                            </h1>

                            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
                                BizTrack gives business owners and cashiers one simple workspace to manage sales,
                                inventory, payments, customers, subscriptions, and reports.
                            </p>

                            <div className="mt-2 grid max-w-2xl gap-2.5 sm:grid-cols-2 sm:gap-3">
                                {highlights.map(({ label, icon: Icon }) => (
                                    <div
                                        key={label}
                                        className="group flex cursor-default items-center gap-3 rounded-xl border border-border/60 bg-card/55 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card hover:shadow-md focus-within:border-primary/20 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2 sm:p-3.5"
                                        tabIndex={0}
                                        role="listitem"
                                    >
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary transition-transform duration-200 group-hover:scale-105 group-hover:bg-primary/15 sm:size-11">
                                            <Icon className="size-4.5 stroke-[1.75] sm:size-5" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground/90 transition-colors duration-200 group-hover:text-foreground">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            className="flex flex-col justify-center px-0 sm:px-1"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            tabIndex={0}
                            aria-label="BizTrack showcase slideshow"
                        >
                            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/40 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.45)] transition-shadow duration-300 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)]">
                                <div 
                                    className="relative overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10"
                                    onMouseEnter={() => setIsHoveringImage(true)}
                                    onMouseLeave={() => setIsHoveringImage(false)}
                                >
                                    <div className="relative aspect-[4/3] w-full max-h-[520px] group overflow-hidden">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_34%)]" />

                                        {showcaseImages.map((image, index) => {
                                            const isActive = activeImage === index;
                                            const offset = (index - activeImage + showcaseImages.length) % showcaseImages.length;
                                            const isVisible =
                                                offset === 0 || offset === 1 || offset === showcaseImages.length - 1;

                                            return (
                                                <img
                                                    key={image.src}
                                                    src={image.src}
                                                    alt={image.alt}
                                                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-[700ms] ease-out ${
                                                        isActive
                                                            ? 'z-20 opacity-100 scale-100 translate-y-0'
                                                            : isVisible && offset === 1
                                                              ? 'z-10 opacity-35 scale-[0.92] translate-x-5 translate-y-6 blur-[0.2px]'
                                                              : isVisible && offset === showcaseImages.length - 1
                                                                ? 'z-10 opacity-35 scale-[0.92] -translate-x-5 translate-y-6 blur-[0.2px]'
                                                                : 'z-0 opacity-0 scale-[1.03]'
                                                    } ${
                                                        isActive && isHoveringImage
                                                            ? 'scale-[1.08]'
                                                            : ''
                                                    }`}
                                                    loading={index === 0 ? 'eager' : 'lazy'}
                                                    aria-hidden={!isActive}
                                                    style={{
                                                        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.7s ease-out',
                                                        transformOrigin: 'center center'
                                                    }}
                                                />
                                            );
                                        })}

                                        {/* Subtle Black Overlay on Image */}
                                        <div className={`absolute inset-0 z-15 transition-opacity duration-500 ${
                                            isHoveringImage 
                                                ? 'opacity-40' 
                                                : 'opacity-20'
                                        }`}>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/5" />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.3))]" />
                                        </div>

                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent" />

                                        <div className="absolute left-4 top-4 z-30 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-md">
                                            BizTrack view
                                        </div>

                                        <div
                                            className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-3 rounded-full border border-white/10 bg-black/15 px-4 py-2.5 backdrop-blur-md"
                                            role="tablist"
                                            aria-label="Slideshow controls"
                                        >
                                            {showcaseImages.map((_, index) => {
                                                const isActive = activeImage === index;

                                                return (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleThumbnailClick(index)}
                                                        className={`h-3.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 ${
                                                            isActive
                                                                ? 'w-11 bg-primary shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                                                                : 'w-3.5 bg-white/55 hover:bg-white/80'
                                                        }`}
                                                        role="tab"
                                                        aria-label={`Go to slide ${index + 1}`}
                                                        aria-selected={isActive}
                                                        tabIndex={0}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="border-t border-border/40 px-4 pb-4 pt-4 sm:px-5">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 h-2 w-8 flex-shrink-0 rounded-full bg-primary/30" />
                                            <div className="min-w-0">
                                                <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                                    Manage your business with confidence
                                                </h2>
                                                <p
                                                    className="mt-1 text-sm leading-relaxed text-muted-foreground transition-opacity duration-300 ease-in-out"
                                                    aria-live="polite"
                                                >
                                                    {activeCaption}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}