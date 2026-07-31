import { Head, Link, usePage } from '@inertiajs/react';
import {
    Boxes,
    CreditCard,
    ReceiptText,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';
import landingImageOne from '../../../assets/images/1 img.png';
import landingImageTwo from '../../../assets/images/2 img.png';
import landingImageThree from '../../../assets/images/3 img.png';
import landingImageFour from '../../../assets/images/4 img.png';

const highlights = [
    { label: 'Revenue tracking', icon: WalletCards },
    { label: 'Inventory control', icon: Boxes },
    { label: 'Sales receipts', icon: ReceiptText },
    { label: 'Payment records', icon: CreditCard },
];

const landingImages = [
    landingImageOne,
    landingImageTwo,
    landingImageThree,
    landingImageFour,
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Track. Manage. Grow." />
            <main className="min-h-screen bg-background text-foreground">
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/brand/biztrack-logo.jpg"
                            alt="BizTrack"
                            className="h-12 w-auto rounded-sm object-contain"
                        />
                    </Link>

                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-md px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                >
                                    Create account
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_34rem] lg:px-8 lg:py-16">
                    <div className="flex flex-col justify-center">
                        <div className="inline-flex w-fit items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
                            <ShieldCheck className="size-4 text-primary" />
                            Control Your Small Business in a smart way with BizTrack
                        </div>
                        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
                            Track every sale, manage every product, and grow with clean business records.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                            BizTrack gives owners and cashiers one professional workspace for revenue,
                            inventory, customers, payments, subscriptions, and reports.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={auth.user ? dashboard() : register()}
                                className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                            >
                                Start tracking
                            </Link>
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="rounded-md border bg-card px-5 py-3 text-sm font-semibold shadow-sm hover:bg-accent"
                            >
                                Open workspace
                            </Link>
                        </div>

                        <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
                            {highlights.map(({ label, icon: Icon }) => (
                                <div key={label} className="flex items-center gap-3 rounded-md border bg-card p-3 shadow-sm">
                                    <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                                        <Icon className="size-4" />
                                    </div>
                                    <span className="text-sm font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative min-h-[26rem] overflow-hidden rounded-md border bg-card shadow-xl shadow-primary/10 lg:min-h-[34rem]">
                        {landingImages.map((image, index) => (
                            <img
                                key={image}
                                src={image}
                                alt=""
                                aria-hidden="true"
                                className="landing-hero-image absolute inset-0 h-full w-full object-cover"
                                style={{ animationDelay: `${index * 5}s` }}
                            />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-white/10" />
                        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                            <div className="max-w-md">
                                <p className="text-sm font-medium text-white/80">Built for real business operations</p>
                                <h2 className="mt-2 text-3xl font-semibold leading-tight">
                                    Sales, stock, payments, and reports in one calm workspace.
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-white/75">
                                    BizTrack gives owners a clear view of daily operations while employees get focused tools for the work they are trusted to do.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
