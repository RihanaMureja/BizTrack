import { Head } from '@inertiajs/react';
import { CheckCircle2, CreditCard } from 'lucide-react';
import type { BusinessFormSubscription } from '@/components/forms/business-form';

type Props = {
    subscriptions: BusinessFormSubscription[];
};

export default function BusinessSubscriptions({ subscriptions }: Props) {
    return (
        <>
            <Head title="Subscription Plans" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <CreditCard className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Subscription Plans</h1>
                        <p className="text-sm text-muted-foreground">
                            Plans control future limits like cashier capacity and advanced reporting access.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {subscriptions.map((subscription) => (
                        <article key={subscription.id} className="rounded-md border bg-card p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-semibold">{subscription.name}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {subscription.description}
                                    </p>
                                </div>
                                <CheckCircle2 className="size-5 text-primary" />
                            </div>
                            <div className="mt-6">
                                <span className="text-3xl font-semibold">
                                    {Number(subscription.price).toLocaleString()}
                                </span>
                                <span className="ml-1 text-sm text-muted-foreground">ETB / month</span>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Up to {subscription.max_cashiers} cashier account
                                {subscription.max_cashiers === 1 ? '' : 's'}.
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </>
    );
}

BusinessSubscriptions.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Subscriptions', href: '/business/subscriptions' },
    ],
};
