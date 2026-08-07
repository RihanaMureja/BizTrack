import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { PlanCard } from '@/components/onboarding/plan-card';
import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/layouts/onboarding-layout';
import { router } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';

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
    return (
        <OnboardingLayout title="Choose plan">
            <OnboardingProgress current="plan" />
            <section className="rounded-lg border border-white/10 bg-[#07030f] px-5 py-10 text-white shadow-2xl md:px-8 lg:px-10">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-sm font-medium text-emerald-300">{business?.business_name ?? 'Your business'}</p>
                    <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Our Pricing Plan</h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/70">
                        Start with a 14-day free trial after phone verification. Choose a paid plan when your business is ready to continue.
                    </p>
                    <Button onClick={() => router.post('/onboarding/trial')} className="mt-6 border border-emerald-300/25 bg-emerald-400 text-emerald-950 hover:bg-emerald-300">
                        <Sparkles className="size-4" />
                        Start 14-Day Free Trial
                    </Button>
                </div>

                <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-3">
                    {subscriptions.map((subscription) => <PlanCard key={subscription.id} plan={subscription} />)}
                </div>
            </section>
        </OnboardingLayout>
    );
}
