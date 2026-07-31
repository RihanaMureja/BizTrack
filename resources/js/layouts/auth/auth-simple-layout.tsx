import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh bg-background">
            <Link href={home()} className="absolute top-5 left-5 flex items-center md:top-8 md:left-8">
                <img src="/brand/biztrack-logo.jpg" alt="BizTrack" className="h-12 w-auto max-w-44 rounded-sm object-contain object-left" />
            </Link>

            <main className="flex min-h-svh w-full items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="flex flex-col gap-8 rounded-md border bg-card p-6 shadow-sm md:p-8">
                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-semibold">{title}</h1>
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
