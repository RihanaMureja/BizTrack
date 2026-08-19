import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh overflow-hidden bg-[#f7fbf8] text-[#10231a]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(0,107,63,0.1),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(52,211,153,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,251,248,0.96))]" />
            <Link href={home()} className="absolute top-5 left-5 z-10 flex items-center md:top-7 md:left-8">
                <img src="/brand/biztrack-logo.jpg" alt="BizTrack" className="h-11 w-auto max-w-40 rounded-md bg-white/80 object-contain object-left p-1.5 shadow-sm ring-1 ring-[#dce9e1]" />
            </Link>

            <main className="relative z-10 flex min-h-svh w-full items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
                <div className="w-full max-w-[27rem]">
                    <div className="flex flex-col gap-6 rounded-2xl border border-[#d9e8df] bg-white/94 p-6 shadow-[0_24px_70px_-38px_rgba(0,44,26,0.42)] backdrop-blur md:p-7">
                        <div className="space-y-2 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#006b3f]">
                                BizTrack
                            </p>
                            <h1 className="text-2xl font-semibold tracking-normal text-[#10231a]">{title}</h1>
                            <p className="mx-auto max-w-sm text-sm leading-6 text-[#607568]">
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
