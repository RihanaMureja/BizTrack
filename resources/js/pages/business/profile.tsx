import { BusinessForm } from '@/components/forms/business-form';
import { Head } from '@inertiajs/react';
import { Building2, ShieldCheck } from 'lucide-react';
import type { BusinessFormBusiness, BusinessFormSubscription } from '@/components/forms/business-form';

type Props = {
    business: BusinessFormBusiness | null;
    subscriptions: BusinessFormSubscription[];
};

export default function BusinessProfile({ business, subscriptions }: Props) {
    return (
        <>
            <Head title="Business Profile" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <Building2 className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Business Profile</h1>
                        <p className="text-sm text-muted-foreground">
                            Core business details used across inventory, sales, receipts, and reports.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,48rem)_minmax(18rem,24rem)]">
                    <section className="rounded-md border bg-card p-5 shadow-sm">
                        <BusinessForm business={business} subscriptions={subscriptions} />
                    </section>

                    <aside className="h-fit rounded-md border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-primary" />
                            <h2 className="font-semibold">Business access</h2>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            This profile becomes the owner workspace for products, inventory, cashiers,
                            customers, sales, expenses, and reports. Cashiers created later will inherit this
                            business scope automatically.
                        </p>
                    </aside>
                </div>
            </div>
        </>
    );
}

BusinessProfile.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Business Profile', href: '/business/profile' },
    ],
};
