import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Clock3,
    CreditCard,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type SubscriptionPlan = {
    id: number;
    name: string;
    price: string | number;
    duration_months: number;
    duration_days: number | null;
    max_cashiers: number;
    description: string | null;
    features: string[] | null;
};

type Props = {
    subscriptions: SubscriptionPlan[];
    currentPlanId?: number | null;
    selectedPlanId?: number | null;
    subscriptionStatus?: string;
};

const STATUS_ACTIVE = 'active';
const STATUS_PENDING = 'pending';

export default function BusinessSubscriptions({
    subscriptions,
    currentPlanId,
    selectedPlanId,
    subscriptionStatus,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const [processingId, setProcessingId] = useState<number | null>(null);

    const isCurrentPlanActive =
        subscriptionStatus === STATUS_ACTIVE && currentPlanId != null;
    const currentPrice = Number(
        subscriptions.find((plan) => plan.id === currentPlanId)?.price ?? 0,
    );
    const hasFreeTrial = subscriptions.some((plan) => Number(plan.price) === 0);
    const recommendedId =
        subscriptions.length > 2
            ? subscriptions[Math.floor(subscriptions.length / 2)].id
            : subscriptions[subscriptions.length - 1]?.id;

    const choose = (plan: SubscriptionPlan) => {
        setProcessingId(plan.id);
        router.post('/subscriptions/select', {
            plan_id: plan.id,
            back: '/business/subscriptions',
        });
    };

    return (
        <>
            <Head title="Subscription Plans" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 lg:p-6">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            aria-label="Go back"
                            title="Back to business profile"
                            asChild
                        >
                            <Link href="/business/profile">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold">
                                Subscription
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your plan, upgrade, or downgrade at any
                                time.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <CreditCard className="size-6" />
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                            Choose the right plan for your business
                        </h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                            Start with the plan that fits your business and
                            upgrade as you grow.
                        </p>
                    </div>

                    {subscriptionStatus === STATUS_PENDING && (
                        <div className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-lg border bg-muted/50 p-4 text-sm">
                            <Clock3 className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">
                                    Subscription request pending
                                </p>
                                <p className="mt-1 text-muted-foreground">
                                    Your paid plan will be activated as soon as
                                    payment is confirmed by an administrator.
                                </p>
                            </div>
                        </div>
                    )}

                    {flash?.status && (
                        <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-primary/30 bg-primary/5 p-4 text-center text-sm text-primary">
                            {flash.status}
                        </div>
                    )}

                    <div className="mt-10 grid grid-cols-1 items-start gap-6 md:grid-cols-3">
                        {subscriptions.map((plan) => {
                            const price = Number(plan.price);
                            const isFree = price === 0;
                            const isRecommended = plan.id === recommendedId;
                            const isCurrentPlan = plan.id === currentPlanId;
                            const isCurrentActive =
                                isCurrentPlan && isCurrentPlanActive;
                            const isCurrentPending =
                                isCurrentPlan &&
                                subscriptionStatus === STATUS_PENDING;
                            const isSelectedForPurchase =
                                plan.id === selectedPlanId &&
                                plan.id !== currentPlanId;
                            const isProcessing = processingId === plan.id;

                            const billingCycle = plan.duration_days
                                ? `${plan.duration_days}-day trial`
                                : plan.duration_months > 1
                                  ? `Every ${plan.duration_months} months`
                                  : 'Billed monthly';

                            const ctaLabel = isCurrentActive
                                ? 'Current Plan'
                                : isCurrentPending
                                  ? 'Request pending'
                                  : isFree
                                    ? 'Start Free Trial'
                                    : isCurrentPlanActive
                                      ? `${price > currentPrice ? 'Upgrade' : 'Downgrade'} to ${plan.name}`
                                      : `Choose ${plan.name}`;

                            return (
                                <article
                                    key={plan.id}
                                    className={cn(
                                        'relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow',
                                        isRecommended &&
                                            'border-primary/60 shadow-lg ring-1 shadow-primary/10 ring-primary/20 lg:z-10 lg:-mt-3 dark:border-primary/50',
                                        isSelectedForPurchase &&
                                            'border-primary/70 ring-1 ring-primary/30',
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h2 className="text-lg font-semibold">
                                            {plan.name}
                                        </h2>
                                        {isSelectedForPurchase && (
                                            <Badge variant="outline">
                                                Selected
                                            </Badge>
                                        )}
                                        {isRecommended && (
                                            <Badge>
                                                <Sparkles className="size-3" />
                                                Recommended
                                            </Badge>
                                        )}
                                        {isCurrentActive && (
                                            <Badge variant="secondary">
                                                <Check className="size-3" />
                                                Current Plan
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {plan.description}
                                    </p>

                                    <div className="mt-6 flex items-baseline gap-1.5">
                                        <span className="text-4xl font-semibold tracking-tight">
                                            {isFree
                                                ? 'Free'
                                                : price.toLocaleString()}
                                        </span>
                                        {!isFree && (
                                            <span className="text-base font-medium">
                                                ETB
                                            </span>
                                        )}
                                        <span className="text-sm text-muted-foreground">
                                            {isFree
                                                ? `for ${plan.duration_days ?? 30} days`
                                                : '/ month'}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {billingCycle} · up to{' '}
                                        {plan.max_cashiers} cashier account
                                        {plan.max_cashiers === 1 ? '' : 's'}
                                    </p>

                                    {plan.features &&
                                    plan.features.length > 0 ? (
                                        <ul className="mt-6 flex-1 space-y-3">
                                            {plan.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-start gap-2.5 text-sm"
                                                >
                                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="mt-6 flex-1 text-sm text-muted-foreground">
                                            Up to {plan.max_cashiers} cashier
                                            account
                                            {plan.max_cashiers === 1 ? '' : 's'}
                                            .
                                        </div>
                                    )}

                                    <div className="mt-8">
                                        {isCurrentActive || isCurrentPending ? (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                disabled
                                            >
                                                {isCurrentPending ? (
                                                    <Clock3 className="size-4" />
                                                ) : (
                                                    <Check className="size-4" />
                                                )}
                                                {ctaLabel}
                                            </Button>
                                        ) : (
                                            <Button
                                                variant={
                                                    isRecommended
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                className="w-full"
                                                disabled={isProcessing}
                                                onClick={() => choose(plan)}
                                            >
                                                {isProcessing && <Spinner />}
                                                {ctaLabel}
                                            </Button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {hasFreeTrial && (
                        <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                            <Sparkles className="size-4 shrink-0 text-primary" />
                            <p>
                                Start with the free trial — no credit card
                                required. You can upgrade, downgrade, or change
                                your plan at any time.
                            </p>
                        </div>
                    )}
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
