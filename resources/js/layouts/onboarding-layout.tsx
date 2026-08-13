import { Head, Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { AppearanceToggleButton } from '@/components/appearance-toggle-button';

export default function OnboardingLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    return (
        <>
            {title && <Head title={title} />}
            <main className="min-h-screen bg-background text-foreground">
                <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
                    <Link href="/" className="flex items-center">
                        <img src="/brand/biztrack-logo.jpg" alt="BizTrack" className="h-9 w-auto rounded-sm object-contain" />
                    </Link>
                    <AppearanceToggleButton />
                </header>
                <section className="mx-auto w-full max-w-5xl px-5 pb-10 pt-2">
                    {children}
                </section>
            </main>
        </>
    );
}
