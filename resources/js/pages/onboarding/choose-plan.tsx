import { router, useForm } from '@inertiajs/react';
import { Clock3, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { DemoPlanPaymentModal } from '@/components/subscriptions/demo-plan-payment-modal';
import type { DemoPaymentPlan } from '@/components/subscriptions/demo-plan-payment-modal';
import { PlanSelectionCard } from '@/components/subscriptions/plan-selection-card';
import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/layouts/onboarding-layout';

type Subscription = {
    id: number;
    name: string;
    price: string | number;
    duration_months: number;
    max_cashiers: number;
    description?: string | null;
};

type Business = {
    business_name: string;
    business_type?: string | null;
} | null;

export default function ChoosePlan({ business, subscriptions }: { business: Business; subscriptions: Subscription[] }) {
    const [selectedPlan, setSelectedPlan] = useState<DemoPaymentPlan | null>(null);
    const form = useForm({});
    const featuredIndex = Math.max(0, Math.floor(subscriptions.length / 2));

    const confirmPlan = () => {
        if (!selectedPlan) return;
        form.post(`/onboarding/plans/${selectedPlan.id}`, {
            preserveScroll: true,
            onSuccess: () => setSelectedPlan(null),
        });
    };

    return (
        <OnboardingLayout title="Choose plan">
            <div className="w-full">
                {/* Compact horizontal progress indicator */}
                <div className="mb-4">
                    <OnboardingProgress current="plan" />
                </div>

                {/* Page header */}
                <div className="mb-5">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Choose the Right Plan
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {business?.business_name ?? 'Your business'} is ready for the next step. Pick a plan or start a free trial.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                            onClick={() => router.post('/onboarding/trial')}
                            size="sm"
                            className="bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                        >
                            <Sparkles className="size-3.5" />
                            Start 14-Day Free Trial
                        </Button>
                        <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
                            <Clock3 className="size-3.5 text-primary" />
                            Monthly billing
                        </div>
                    </div>
                </div>

                {/* Subscription plan cards — full available width */}
                <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
                    {subscriptions.map((subscription, index) => (
                        <PlanSelectionCard
                            key={subscription.id}
                            plan={subscription}
                            featured={index === featuredIndex}
                            actionLabel="Continue to payment"
                            onSelect={setSelectedPlan}
                        />
                    ))}
                </div>
            </div>

            <DemoPlanPaymentModal
                open={Boolean(selectedPlan)}
                plan={selectedPlan}
                context="onboarding"
                processing={form.processing}
                onOpenChange={(open) => !open && setSelectedPlan(null)}
                onConfirm={confirmPlan}
            />
        </OnboardingLayout>
    );
}
