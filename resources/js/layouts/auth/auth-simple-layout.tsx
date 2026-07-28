import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-[1.05fr_0.95fr]">
            <div className="hidden min-h-svh flex-col justify-between border-r bg-sidebar p-10 text-sidebar-foreground lg:flex">
                <Link href={home()} className="flex items-center">
                    <div>
                        <img src="/brand/biztrack-logo.jpg" alt="BizTrack" className="h-12 w-auto rounded-sm object-contain" />
                        <div className="mt-2 text-sm text-sidebar-foreground/65">
                            Business command center
                        </div>
                    </div>
                </Link>

                <div className="max-w-xl">
                    <p className="text-4xl leading-tight font-semibold tracking-normal">
                        Track revenue, stock, payments, and expenses from one focused workspace.
                    </p>
                    <p className="mt-5 text-base leading-7 text-sidebar-foreground/70">
                        Built for owners and cashiers who need fast decisions, clean records, and fewer manual mistakes.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm text-sidebar-foreground/75">
                    <div className="rounded-md border border-sidebar-border bg-sidebar-accent/60 p-3">
                        Sales
                    </div>
                    <div className="rounded-md border border-sidebar-border bg-sidebar-accent/60 p-3">
                        Inventory
                    </div>
                    <div className="rounded-md border border-sidebar-border bg-sidebar-accent/60 p-3">
                        Reports
                    </div>
                </div>
            </div>

            <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8 rounded-md border bg-card p-6 shadow-sm md:p-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 font-medium"
                            >
                                <img src="/brand/biztrack-logo.jpg" alt="BizTrack" className="h-12 w-auto rounded-sm object-contain" />
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-medium">{title}</h1>
                                <p className="text-center text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
