import { Head, Link } from '@inertiajs/react';
import { Building2, CreditCard, Crown, Pencil, Sparkles } from 'lucide-react';
import { useState } from 'react';
import DeleteUser from '@/components/delete-user';
import { BusinessForm } from '@/components/forms/business-form';
import type { BusinessFormBusiness, BusinessFormSubscription } from '@/components/forms/business-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { businessTypeLabel } from '@/lib/business-types';

type SubscriptionInfo = {
    id: number;
    name: string;
    price: string | number;
    description?: string | null;
    duration_months: number;
    duration_days?: number | null;
    max_cashiers: number;
};

type Props = {
    business: (BusinessFormBusiness & {
        subscription?: SubscriptionInfo | null;
        subscription_status?: string | null;
        subscription_ends_at?: string | null;
    }) | null;
    logoUrl?: string | null;
    usage?: {
        users_count: number;
        products_count: number;
        max_cashiers: number | null;
    };
    subscriptions: BusinessFormSubscription[];
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { label: 'Active', variant: 'default' },
    pending: { label: 'Pending', variant: 'secondary' },
    expired: { label: 'Expired', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'secondary' },
    none: { label: 'No Plan', variant: 'outline' },
};

const formatDate = (date: Date) => date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

export default function BusinessProfile({ business, logoUrl, usage, subscriptions }: Props) {
    const [editOpen, setEditOpen] = useState(false);

    const name = business?.business_name ?? '';
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join('');

    const plan = business?.subscription ?? null;
    const status = business?.subscription_status ?? 'none';
    const statusBadge = statusConfig[status] ?? { label: status, variant: 'outline' as const };
    const endsAt = business?.subscription_ends_at ? new Date(business.subscription_ends_at) : null;

    const billingLabel =
        status === 'pending' ? 'Awaiting activation'
        : status === 'active' && plan ? 'Renews'
        : status === 'expired' ? 'Expired'
        : status === 'cancelled' ? 'Cancelled'
        : 'Subscription';

    const billingValue =
        status === 'pending' ? 'Your plan is being activated. An admin will confirm your payment shortly.'
        : endsAt ? formatDate(endsAt)
        : plan ? '—'
        : 'No active plan. Choose a plan to get started.';

    const billingCycle = plan
        ? plan.duration_days
            ? `${plan.duration_days}-day billing`
            : `${Math.max(1, plan.duration_months)}-month billing`
        : '—';

    const maxCashiers = usage?.max_cashiers ?? null;
    const usersCount = usage?.users_count ?? 0;
    const productsCount = usage?.products_count ?? 0;

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
                            Manage your business information and subscription.
                        </p>
                    </div>
                </div>

                <section className="rounded-md border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt={`${name} logo`}
                                    className="size-16 shrink-0 rounded-lg border object-cover"
                                />
                            ) : (
                                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl font-semibold text-primary">
                                    {initials || <Building2 className="size-8" />}
                                </div>
                            )}
                            <div className="min-w-0">
                                <h2 className="truncate text-lg font-semibold">{name || 'Unnamed business'}</h2>
                                <p className="mt-0.5 text-sm capitalize text-muted-foreground">
                                    {business ? businessTypeLabel(business.business_type) : 'Set up your business to get started'}
                                </p>
                            </div>
                        </div>
                        <Button type="button" onClick={() => setEditOpen(true)} className="w-fit">
                            <Pencil className="size-4" />
                            Edit Profile
                        </Button>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-semibold">Business Information</h2>
                    <div className="rounded-md border bg-card p-5 shadow-sm">
                        <dl className="grid gap-6 sm:grid-cols-2">
                            <InfoField label="Business Name" value={name} />
                            <InfoField label="Business Type" value={business ? businessTypeLabel(business.business_type) : null} />
                            <InfoField label="Phone" value={business?.phone} />
                            <InfoField label="Email" value={business?.email} />
                            <div className="sm:col-span-2">
                                <InfoField label="Address" value={business?.address} />
                            </div>
                        </dl>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-semibold">Subscription</h2>
                    <div className="rounded-md border bg-card p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <Crown className="size-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">{plan?.name ?? 'No plan selected'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {plan
                                            ? Number(plan.price) > 0
                                                ? `${Number(plan.price).toLocaleString()} ETB / month`
                                                : 'Free plan'
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </div>

                        <div className="mt-6 grid gap-6 border-t pt-5 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">{billingLabel}</p>
                                <p className="mt-1 text-sm">{billingValue}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Billing cycle</p>
                                <p className="mt-1 text-sm">{billingCycle}</p>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-5">
                            <p className="text-sm font-semibold">Plan usage</p>
                            <div className="mt-4 grid gap-5 sm:grid-cols-2">
                                <UsageMetric label="Users" used={usersCount} total={maxCashiers} />
                                <UsageMetric label="Products" used={productsCount} total={null} />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row">
                            <Button asChild>
                                <Link href="/business/subscriptions">
                                    <CreditCard className="size-4" />
                                    Manage Subscription
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/business/subscriptions">
                                    <Sparkles className="size-4" />
                                    Compare Plans
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <DeleteUser />
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit business profile</DialogTitle>
                    </DialogHeader>
                    <BusinessForm business={business} subscriptions={subscriptions} />
                </DialogContent>
            </Dialog>
        </>
    );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
    const hasValue = Boolean(value?.trim());

    return (
        <div>
            <dt className="text-xs font-medium text-muted-foreground uppercase">{label}</dt>
            <dd className="mt-1 text-sm break-words">{hasValue ? value : 'Not set'}</dd>
        </div>
    );
}

function UsageMetric({ label, used, total }: { label: string; used: number; total?: number | null }) {
    const hasLimit = typeof total === 'number' && total > 0;
    const percent = hasLimit ? Math.min(100, Math.round((used / total) * 100)) : null;

    return (
        <div>
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">
                    {used.toLocaleString()} / {hasLimit ? total.toLocaleString() : 'Unlimited'}
                </p>
            </div>
            {percent !== null && (
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
            )}
        </div>
    );
}

BusinessProfile.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Business Profile', href: '/business/profile' },
    ],
};
