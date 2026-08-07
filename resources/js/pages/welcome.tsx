import { Head, Link, usePage } from '@inertiajs/react';
import { AppearanceToggleButton } from '@/components/appearance-toggle-button';
import {
    Boxes,
    CreditCard,
    KeyRound,
    ReceiptText,
    ScrollText,
    ShieldCheck,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import { dashboard, login } from '@/routes';
import landingImageOne from '../../../assets/images/1 img.png';
import landingImageTwo from '../../../assets/images/2 img.png';
import landingImageThree from '../../../assets/images/3 img.png';
import landingImageFour from '../../../assets/images/4 img.png';

const highlights = [
    { label: 'POS sales', icon: ReceiptText },
    { label: 'Stock control', icon: Boxes },
    { label: 'Customer credit', icon: WalletCards },
    { label: 'Payment records', icon: CreditCard },
];

const features = [
    {
        title: 'Sell with control',
        description: 'Record sales, payments, discounts, and customer credit without scattered notebooks.',
        icon: ReceiptText,
    },
    {
        title: 'Know your stock',
        description: 'Track products, available stock, low-stock items, and slow-moving inventory.',
        icon: Boxes,
    },
    {
        title: 'Manage your team',
        description: 'Give employees only the permissions they need for their daily work.',
        icon: UsersRound,
    },
    {
        title: 'Stay verified',
        description: 'Business documents, subscriptions, audit logs, and reports stay organized.',
        icon: ScrollText,
    },
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
            <Head title="Business Management Software" />
            <main className="min-h-screen bg-background text-foreground">
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/brand/biztrack-logo.jpg"
                            alt="BizTrack"
                            className="h-10 w-auto rounded-sm object-contain"
                        />
                    </Link>

                    <nav className="flex items-center gap-2">
                        <AppearanceToggleButton />
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="rounded-md px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                            >
                                Log in
                            </Link>
                        )}
                    </nav>
                </header>

                <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_32rem] lg:px-8 lg:py-12">
                    <div className="flex flex-col justify-center">
                        <div className="inline-flex w-fit items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
                            <ShieldCheck className="size-4 text-primary" />
                            Verified business management for growing SMEs
                        </div>
                        <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-normal md:text-5xl">
                            Run sales, stock, payments, and reports from one clean workspace.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                            BizTrack helps business owners manage POS sales, products, inventory,
                            employees, customer credit, expenses, and reports without spreadsheet chaos.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                            >
                                Log in
                            </Link>
                        </div>

                        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
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

                    <div className="relative min-h-[23rem] overflow-hidden rounded-md border bg-card shadow-xl shadow-primary/10 lg:min-h-[31rem]">
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
                                <h2 className="mt-2 text-2xl font-semibold leading-tight">
                                    Daily work stays organized from checkout to reporting.
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-white/75">
                                    Owners see the full picture while employees work inside the permissions they are trusted with.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-7xl px-5 pb-14 lg:px-8">
                    <div className="rounded-md border bg-card p-5 shadow-sm md:p-6">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-primary">What BizTrack handles</p>
                                <h2 className="mt-2 text-2xl font-semibold">The important business work, connected.</h2>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                                <KeyRound className="size-4" />
                                Verified access and role-based permissions
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {features.map(({ title, description, icon: Icon }) => (
                                <div key={title} className="rounded-md border bg-background p-4">
                                    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="mt-4 font-semibold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
