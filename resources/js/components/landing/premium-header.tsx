import { Link } from '@inertiajs/react';
import { login } from '@/routes';

export function PremiumHeader() {
    return (
        <header className="fixed inset-x-0 top-0 z-40 w-full border-b border-white/10 bg-slate-950/30 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-5 lg:px-8">
                <Link href="/" className="flex flex-shrink-0 items-center transition-transform hover:scale-[1.02]">
                    <img
                        src="/brand/biztrack-logo.jpg"
                        alt="BizTrack Logo"
                        className="h-9 w-auto rounded-sm object-contain sm:h-10"
                    />
                </Link>

                <Link
                    href={login()}
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-black/10 active:scale-95"
                >
                    Login
                </Link>
            </div>
        </header>
    );
}
