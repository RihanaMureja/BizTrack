import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    CheckCircle2,
    CreditCard,
    ReceiptText,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';

const highlights = [
    { label: 'Revenue tracking', icon: WalletCards },
    { label: 'Inventory control', icon: Boxes },
    { label: 'Sales receipts', icon: ReceiptText },
    { label: 'Payment records', icon: CreditCard },
];

const metrics = [
    ['0 ETB', 'Starter plan ready'],
    ['3', 'Subscription tiers'],
    ['Role based', 'Owner, cashier, admin'],
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

                <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_30rem] lg:px-8 lg:py-16">
                    <div className="flex flex-col justify-center">
                        <div className="inline-flex w-fit items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
                            <ShieldCheck className="size-4 text-primary" />
                            Built for small business control
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

                    <div className="rounded-md border bg-card p-5 shadow-xl shadow-primary/10">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Today overview</p>
                                <h2 className="mt-1 text-2xl font-semibold">Business command center</h2>
                            </div>
                            <BarChart3 className="size-8 text-primary" />
                        </div>

                        <div className="mt-5 grid gap-3">
                            {metrics.map(([value, label]) => (
                                <div key={label} className="rounded-md bg-background p-4">
                                    <p className="text-2xl font-semibold">{value}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 rounded-md bg-sidebar p-5 text-sidebar-foreground">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-sidebar-primary" />
                                <p className="font-semibold">Ready for the Next Chapter of Business</p>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-sidebar-foreground/70">
                                Foundation, auth, subscriptions, dashboards, and categories are prepared for the product catalog phase.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
