import { Head } from '@inertiajs/react';
import { BadgeCheck, CreditCard, Sparkles } from 'lucide-react';
import type { BusinessFormSubscription } from '@/components/forms/business-form';
import { PlanSelectionCard } from '@/components/subscriptions/plan-selection-card';
import { Badge } from '@/components/ui/badge';

type Props = {
    subscriptions: BusinessFormSubscription[];
    business?: { business_name?: string | null; subscription_id?: number | null } | null;
};

export default function BusinessSubscriptions({ subscriptions, business }: Props) {
    const featuredIndex = Math.max(0, Math.floor(subscriptions.length / 2));

    return (
        <>
            <Head title="Subscription Plans" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <section className="relative overflow-hidden rounded-3xl border bg-card/80 p-6 shadow-sm backdrop-blur lg:p-8">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
                        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-400/10" />
                    </div>

                    <div className="relative flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-3xl">
                            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                                Subscription plans
                            </Badge>
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Choose the Right Plan for Your Business</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                                Review the plans, compare limits, and switch when your team needs more room.
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <CreditCard className="size-5" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current plan</p>
                                    <p className="text-sm font-medium">{business?.business_name ?? 'Business account'}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs leading-5 text-muted-foreground">
                                The active plan stays highlighted for quick reference.
                            </p>
                        </div>
                    </div>

                    <div className="relative mt-6 grid gap-5 xl:grid-cols-3">
                        {subscriptions.map((subscription, index) => (
                            <PlanSelectionCard
                                key={subscription.id}
                                plan={subscription}
                                current={business?.subscription_id === subscription.id}
                                featured={index === featuredIndex}
                                readOnly
                            />
                        ))}
                    </div>

                    <div className="relative mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 shadow-sm">
                            <BadgeCheck className="size-4 text-primary" />
                            Compare price, billing period, and limits at a glance.
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 shadow-sm">
                            <Sparkles className="size-4 text-primary" />
                            Recommended plan is emphasized, and the current plan is still visible.
                        </div>
                    </div>
                </section>
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
