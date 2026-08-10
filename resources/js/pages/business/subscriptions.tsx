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
import type {
    SubscriptionPlan,
    SubscriptionRecommendation,
} from '@/types/subscriptions';

type Props = {
    subscriptions: SubscriptionPlan[];
    currentPlanId?: number | null;
    selectedPlanId?: number | null;
    subscriptionStatus?: string;
    cashiersCount?: number;
    recommendation?: SubscriptionRecommendation | null;
};

const STATUS_ACTIVE = 'active';
const STATUS_PENDING = 'pending';
const STATUS_NONE = 'none';

export default function BusinessSubscriptions({
    subscriptions,
    currentPlanId,
    selectedPlanId,
    subscriptionStatus,
    cashiersCount = 0,
    recommendation = null,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const [processingId, setProcessingId] = useState<number | null>(null);

    const isCurrentPlanActive =
        subscriptionStatus === STATUS_ACTIVE && currentPlanId != null;
    const currentPlan =
        subscriptions.find((plan) => plan.id === currentPlanId) ?? null;
    const currentPrice = Number(currentPlan?.price ?? 0);
    const hasFreeTrial = subscriptions.some((plan) => Number(plan.price) === 0);
    const isEligibleForFreeTrial = subscriptionStatus === STATUS_NONE;
    const currentMaxCashiers = currentPlan?.max_cashiers ?? 0;
    const hasCurrentPlan = currentPlan != null;
    const isAtCashierLimit =
        hasCurrentPlan &&
        currentMaxCashiers > 0 &&
        cashiersCount >= currentMaxCashiers;
    const recommendedPlan = recommendation?.recommendedPlan ?? null;
    const recommendedId =
        recommendedPlan?.id ??
        subscriptions.find(
            (plan) =>
                plan.id !== currentPlanId &&
                Number(plan.price) > 0 &&
                plan.max_cashiers >= Math.max(1, cashiersCount),
        )?.id ??
        subscriptions.find(
            (plan) => plan.id !== currentPlanId && Number(plan.price) > 0,
        )?.id ??
        subscriptions[subscriptions.length - 1]?.id;

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

                    {hasCurrentPlan && (
                        <div className="mt-6 rounded-lg border bg-card p-4 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                        Current plan
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <p className="text-lg font-semibold">
                                            {currentPlan.name}
                                        </p>
                                        {isCurrentPlanActive && (
                                            <Badge variant="secondary">
                                                <Check className="size-3" />
                                                Active
                                            </Badge>
                                        )}
                                        {subscriptionStatus ===
                                            STATUS_PENDING && (
                                            <Badge variant="outline">
                                                <Clock3 className="size-3" />
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        {Number(currentPlan.price) > 0
                                            ? `${Number(currentPlan.price).toLocaleString()} ETB / month`
                                            : 'Free plan'}
                                    </p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-sm font-medium">
                                        Cashiers:{' '}
                                        {cashiersCount.toLocaleString()} /{' '}
                                        {currentMaxCashiers.toLocaleString()}
                                    </p>
                                    {currentMaxCashiers > 0 && (
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary sm:w-56">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full',
                                                    isAtCashierLimit
                                                        ? 'bg-destructive'
                                                        : 'bg-primary',
                                                )}
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        Math.round(
                                                            (cashiersCount /
                                                                currentMaxCashiers) *
                                                                100,
                                                        ),
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                    {isAtCashierLimit && (
                                        <p className="mt-1 text-xs text-destructive">
                                            Cashier limit reached for this plan.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {recommendation?.isExpiring && (
                        <div className="mt-4 flex flex-col gap-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <p className="font-semibold">
                                        Your{' '}
                                        {recommendation.currentPlan?.name ??
                                            'subscription'}{' '}
                                        expires in{' '}
                                        {recommendation.daysRemaining} day
                                        {recommendation.daysRemaining === 1
                                            ? ''
                                            : 's'}
                                    </p>
                                    <p className="mt-1 text-muted-foreground">
                                        {recommendation.isRenewal
                                            ? `Renew your ${recommendation.currentPlan?.name ?? 'plan'} to keep using all its features without interruption.`
                                            : `Switch to ${recommendation.recommendedPlan?.name ?? 'the recommended plan'} to avoid any interruption.`}
                                    </p>
                                </div>
                            </div>
                            {recommendedPlan && (
                                <Button
                                    type="button"
                                    className="shrink-0"
                                    disabled={
                                        processingId === recommendedPlan.id
                                    }
                                    onClick={() => choose(recommendedPlan)}
                                >
                                    {processingId === recommendedPlan.id && (
                                        <Spinner />
                                    )}
                                    {recommendation.isRenewal
                                        ? `Renew ${recommendedPlan.name}`
                                        : `Upgrade to ${recommendedPlan.name}`}
                                </Button>
                            )}
                        </div>
                    )}

                    {recommendation?.limitReached && (
                        <div className="mt-4 flex flex-col gap-4 rounded-lg border bg-primary/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
                                <div>
                                    <p className="font-semibold">
                                        Recommended for your business
                                    </p>
                                    <p className="mt-1 text-muted-foreground">
                                        You have{' '}
                                        {cashiersCount.toLocaleString()}{' '}
                                        cashiers but the{' '}
                                        {currentPlan?.name ?? 'current plan'}{' '}
                                        plan allows{' '}
                                        {currentMaxCashiers.toLocaleString()}.
                                        {recommendedPlan
                                            ? ` Upgrade to ${recommendedPlan.name} for up to ${recommendedPlan.max_cashiers} cashier accounts.`
                                            : ' Upgrade to a plan with more cashier accounts to keep adding staff.'}
                                    </p>
                                </div>
                            </div>
                            {recommendedPlan && (
                                <Button
                                    type="button"
                                    className="shrink-0"
                                    disabled={
                                        processingId === recommendedPlan.id
                                    }
                                    onClick={() => choose(recommendedPlan)}
                                >
                                    {processingId === recommendedPlan.id && (
                                        <Spinner />
                                    )}
                                    Upgrade to {recommendedPlan.name}
                                </Button>
                            )}
                        </div>
                    )}

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
                            const isFreeTrialUnavailable =
                                isFree && !isEligibleForFreeTrial;
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
                                  : isFreeTrialUnavailable
                                    ? 'Free trial unavailable'
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
                                        ) : isFreeTrialUnavailable ? (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                disabled
                                            >
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

                    {hasFreeTrial && isEligibleForFreeTrial && (
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
