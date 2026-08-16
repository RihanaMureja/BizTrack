import { Link } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { login } from '@/routes';

type HeaderTheme = 'hero' | 'light' | 'dark' | 'accent';

const navItems = [
    { label: 'Home', href: '#top' },
    { label: 'About Us', href: '#about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
];

export function PremiumHeader({ landingPage = true }: { landingPage?: boolean }) {
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState<HeaderTheme>('hero');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-header-theme]'));
        const visibleSections = new Set<HTMLElement>();

        const updateTheme = () => {
            const viewportCenter = window.innerHeight / 2;
            const activeSection = Array.from(visibleSections).sort(
                (a, b) =>
                    Math.abs(a.getBoundingClientRect().top + a.getBoundingClientRect().height / 2 - viewportCenter) -
                    Math.abs(b.getBoundingClientRect().top + b.getBoundingClientRect().height / 2 - viewportCenter),
            )[0];

            if (activeSection) {
                setTheme((activeSection.dataset.headerTheme as HeaderTheme) ?? 'light');
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const section = entry.target as HTMLElement;

                    if (entry.isIntersecting) {
visibleSections.add(section);
} else {
visibleSections.delete(section);
}
                });
                updateTheme();
            },
            { rootMargin: '-12% 0px -38%', threshold: [0, 0.1, 0.35, 0.6] },
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    const themeClasses = {
        hero: scrolled
            ? 'border-emerald-100/15 bg-emerald-950/82 text-white shadow-[0_12px_40px_-24px_rgba(2,44,34,0.9)] backdrop-blur-xl'
            : 'border-white/10 bg-emerald-950/25 text-white backdrop-blur-xl',
        light: scrolled
            ? 'border-slate-200/80 bg-white/88 text-slate-900 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl'
            : 'border-slate-200/60 bg-white/72 text-slate-900 backdrop-blur-xl',
        dark: 'border-white/10 bg-slate-950/84 text-white shadow-[0_12px_40px_-24px_rgba(2,6,23,0.8)] backdrop-blur-xl',
        accent: 'border-emerald-100/15 bg-emerald-950/84 text-white shadow-[0_12px_40px_-24px_rgba(2,44,34,0.9)] backdrop-blur-xl',
    } satisfies Record<HeaderTheme, string>;
    const isLight = theme === 'light';

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 w-full border-b transition-all duration-300',
                themeClasses[theme],
            )}
        >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-5 lg:px-8">
                <Link
                    href="/"
                    className="flex flex-shrink-0 items-center transition-transform hover:scale-[1.02]"
                    aria-label="BizTrack home"
                >
                    <img
                        src="/brand/biztrack-logo.jpg"
                        alt="BizTrack"
                        className="h-9 w-auto rounded-sm object-contain sm:h-10"
                    />
                </Link>

                <nav className="hidden items-center gap-8 lg:flex">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={landingPage ? item.href : `/${item.href}`}
                            className={cn(
                                'text-sm font-medium transition-colors',
                                isLight ? 'text-slate-600 hover:text-emerald-700' : 'text-white/80 hover:text-white',
                            )}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    <Link
                        href={login()}
                        className={cn(
                            'text-sm font-medium transition-colors',
                            isLight ? 'text-slate-600 hover:text-emerald-700' : 'text-white/80 hover:text-white',
                        )}
                    >
                        Login
                    </Link>
                </div>

                <div className="flex items-center gap-2 lg:hidden">
                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            'rounded-full border px-4 text-sm font-semibold transition-colors',
                            isLight
                                ? 'border-slate-200 bg-white/70 text-slate-800 hover:bg-slate-100'
                                : 'border-white/15 bg-white/5 text-white hover:bg-white/10',
                        )}
                    >
                        <Link href={login()}>Login</Link>
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    'rounded-full border transition-colors',
                                    isLight
                                        ? 'border-slate-200 bg-white/70 text-slate-800 hover:bg-slate-100'
                                        : 'border-white/15 bg-white/5 text-white hover:bg-white/10',
                                )}
                                aria-label="Open menu"
                            >
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="border-white/10 bg-slate-950 text-white">
                            <SheetHeader className="border-b border-white/10">
                                <SheetTitle className="text-left text-white">BizTrack</SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-col gap-2 p-4">
                                {navItems.map((item) => (
                                    <SheetClose asChild key={item.label}>
                                        <a
                                            href={landingPage ? item.href : `/${item.href}`}
                                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                                        >
                                            {item.label}
                                        </a>
                                    </SheetClose>
                                ))}
                            </div>

                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
