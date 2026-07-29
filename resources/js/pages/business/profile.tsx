import { BusinessForm } from '@/components/forms/business-form';
import { Head } from '@inertiajs/react';
import { Building2, Clock3, ShieldCheck } from 'lucide-react';
import type { BusinessFormBusiness, BusinessFormSubscription } from '@/components/forms/business-form';

type Props = {
    business: BusinessFormBusiness | null;
    subscriptions: BusinessFormSubscription[];
};

export default function BusinessProfile({ business, subscriptions }: Props) {
    const statusLabel = business?.status ? business.status.replace(/_/g, ' ') : 'not submitted';
    const isActive = business?.status === 'active';

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
                            {isActive ? <ShieldCheck className="size-5 text-primary" /> : <Clock3 className="size-5 text-amber-600" />}
                            <h2 className="font-semibold">Verification status</h2>
                        </div>
                        <div className="mt-4 inline-flex rounded-full border bg-background px-3 py-1 text-xs font-semibold capitalize text-foreground">
                            {statusLabel}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Submit your National ID, FAN number, trade license, and TIN certificate for review.
                            VAT and rental documents are only required when they apply to your business.
                        </p>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Products, inventory, cashiers, customers, sales, expenses, and reports unlock after a
                            super admin approves this business.
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
