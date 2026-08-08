import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { businessTypeLabel } from '@/lib/business-types';
import { cn } from '@/lib/utils';

type OnboardingPlan = {
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
    business: {
        id: number;
        business_name: string;
        business_type: string | null;
    };
    plans: OnboardingPlan[];
    selectedPlanId?: number | null;
    subscriptionStatus: string;
};

export default function SubscriptionSelect({
    business,
    plans,
    selectedPlanId,
    subscriptionStatus,
}: Props) {
    const { flash } = usePage().props as { flash?: { status?: string } };
    const [processingId, setProcessingId] = useState<number | null>(null);

    const isPending = subscriptionStatus === 'pending';
    const recommendedId =
        plans.length > 2
            ? plans[Math.floor(plans.length / 2)].id
            : plans[plans.length - 1]?.id;

    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit('/business/setup');
        }
    };

    const choose = (plan: OnboardingPlan) => {
        setProcessingId(plan.id);
        router.post('/subscriptions/select', {
            plan_id: plan.id,
            back: '/subscriptions',
        });
    };

    return (
        <>
            <Head title="Choose a plan" />

            <div className="mb-4 flex">
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={goBack}
                    aria-label="Go back"
                    title="Go back"
                >
                    <ArrowLeft className="size-4" />
                </Button>
            </div>

            <div className="text-center">
                <h1 className="text-2xl font-semibold">
                    Choose a plan for your{' '}
                    {businessTypeLabel(business.business_type)}
                </h1>
                <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
                    Start with a free trial today. You can upgrade or change
                    your plan at any time.
                </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
                {plans.map((plan) => {
                    const isFree = Number(plan.price) === 0;
                    const isProcessing = processingId === plan.id;
                    const isRecommended = plan.id === recommendedId;
                    const isSelectedForPurchase = plan.id === selectedPlanId;

                    return (
                        <article
                            key={plan.id}
                            className={cn(
                                'relative flex flex-col rounded-xl border bg-card p-6 shadow-sm',
                                isRecommended &&
                                    'border-primary/60 shadow-lg ring-1 shadow-primary/10 ring-primary/20 lg:z-10 lg:-mt-2 dark:border-primary/50',
                                isSelectedForPurchase &&
                                    'border-primary/70 ring-1 ring-primary/30',
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="font-semibold">{plan.name}</h2>
                                {isSelectedForPurchase && (
                                    <Badge variant="outline">Selected</Badge>
                                )}
                                {isRecommended && (
                                    <Badge>
                                        <Sparkles className="size-3" />
                                        Recommended
                                    </Badge>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {plan.description}
                            </p>

                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-3xl font-semibold">
                                    {isFree
                                        ? 'Free'
                                        : `${Number(plan.price).toLocaleString()} ETB`}
                                </span>
                                {!isFree && (
                                    <span className="text-sm text-muted-foreground">
                                        / month
                                    </span>
                                )}
                                {isFree && (
                                    <span className="text-sm text-muted-foreground">
                                        · {plan.duration_days ?? 30}-day trial
                                    </span>
                                )}
                            </div>

                            {plan.features && plan.features.length > 0 && (
                                <ul className="mt-5 flex-1 space-y-2">
                                    {plan.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-2 text-sm"
                                        >
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <Button
                                type="button"
                                variant={isRecommended ? 'default' : 'outline'}
                                className="mt-6 w-full"
                                disabled={isProcessing}
                                onClick={() => choose(plan)}
                            >
                                {isProcessing && <Spinner />}
                                {isFree
                                    ? 'Start Free Trial'
                                    : `Choose ${plan.name}`}
                            </Button>
                        </article>
                    );
                })}
            </div>

            {isPending && (
                <div className="mt-6 flex items-start gap-3 rounded-lg border bg-muted/50 p-4 text-sm">
                    <Clock3 className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">
                            Subscription request received
                        </p>
                        <p className="mt-1 text-muted-foreground">
                            Your paid plan will be activated as soon as payment
                            is confirmed. Pick the free trial if you want to
                            start using BizTrack right away.
                        </p>
                    </div>
                </div>
            )}

            {flash?.status && (
                <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-center text-sm text-primary">
                    {flash.status}
                </div>
            )}
        </>
    );
}

SubscriptionSelect.layout = {
    title: 'Choose a plan',
    description: 'Select the subscription that fits your business',
};
