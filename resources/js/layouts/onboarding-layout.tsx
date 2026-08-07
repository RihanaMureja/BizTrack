import { Head, Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { AppearanceToggleButton } from '@/components/appearance-toggle-button';

export default function OnboardingLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    return (
        <>
            {title && <Head title={title} />}
            <main className="min-h-screen bg-background text-foreground">
                <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
                    <Link href="/" className="flex items-center">
                        <img src="/brand/biztrack-logo.jpg" alt="BizTrack" className="h-10 w-auto rounded-sm object-contain" />
                    </Link>
                    <AppearanceToggleButton />
                </header>
                <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-12 pt-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
                    {children}
                </section>
            </main>
        </>
    );
}
