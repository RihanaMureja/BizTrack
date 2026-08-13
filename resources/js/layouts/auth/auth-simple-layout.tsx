import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
    backHref,
}: AuthLayoutProps) {
    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit(backHref ?? home());
        }
    };

    return (
        <div className="relative min-h-svh overflow-hidden bg-[linear-gradient(160deg,oklch(0.18_0.06_153)_0%,oklch(0.14_0.05_153)_45%,oklch(0.08_0.03_153)_100%)] text-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:72px_72px]"
            />

            <Link
                href={home()}
                className="absolute top-5 left-5 z-20 flex items-center rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-md transition-transform hover:scale-[1.02] md:top-8 md:left-8"
            >
                <img
                    src="/brand/biztrack-logo.jpg"
                    alt="BizTrack"
                    className="h-10 w-auto max-w-44 rounded-sm object-contain object-left sm:h-12"
                />
            </Link>

            {backHref ? (
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={goBack}
                    aria-label="Go back"
                    title="Go back"
                    className="absolute top-20 left-5 z-20 border border-white/10 bg-black/20 text-white backdrop-blur-md hover:bg-black/30 md:top-24 md:left-8"
                >
                    <ArrowLeft className="size-4" />
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="absolute top-20 left-5 z-20 border border-white/10 bg-black/20 text-white backdrop-blur-md hover:bg-black/30 md:top-24 md:left-8"
                >
                    <Link href={home()} aria-label="Go back">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
            )}

            <main className="relative z-10 flex min-h-svh w-full items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
                <div className="w-full max-w-[28rem]">
                    <div className="overflow-hidden rounded-3xl border border-white/12 bg-white/95 shadow-[0_30px_90px_-35px_rgba(2,12,8,0.9)] backdrop-blur-xl">
                        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-300" />
                        <div className="border-b border-slate-200/80 px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                                BizTrack Access
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                                    {title}
                                </h1>
                                <p className="max-w-md text-sm leading-6 text-slate-600">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-6 sm:px-8 sm:py-8">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
