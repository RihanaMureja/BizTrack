import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DemoPaymentPlan } from '@/components/subscriptions/demo-plan-payment-modal';
import { Check } from 'lucide-react';

type Props = {
    plan: DemoPaymentPlan;
    current?: boolean;
    actionLabel?: string;
    dark?: boolean;
    onSelect: (plan: DemoPaymentPlan) => void;
};

export function PlanSelectionCard({ plan, current = false, actionLabel = 'Choose plan', dark = false, onSelect }: Props) {
    const price = Number(plan.price);
    const features = [
        `${plan.max_cashiers} employees included`,
        `${plan.duration_months} month billing period`,
        'Sales, inventory, customers, and reports',
        'Role-based employee permissions',
    ];

    return (
        <article className={dark ? 'flex min-h-[23rem] flex-col rounded-md border border-white/15 bg-white/[0.04] p-5 text-white shadow-xl shadow-black/30' : 'flex min-h-[21rem] flex-col rounded-md border bg-card p-5 shadow-sm'}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold">{plan.name}</h3>
                        {current && <Badge variant="default">Current plan</Badge>}
                    </div>
                    <p className={dark ? 'mt-3 min-h-12 text-sm leading-5 text-white/70' : 'mt-3 min-h-12 text-sm leading-5 text-muted-foreground'}>
                        {plan.description ?? 'A practical plan for growing business operations.'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-semibold">{price.toLocaleString()} ETB</p>
                    <p className={dark ? 'text-xs text-white/55' : 'text-xs text-muted-foreground'}>per month</p>
                </div>
            </div>

            <div className="mt-6 grid gap-3">
                {features.map((feature) => (
                    <div key={feature} className={dark ? 'flex items-center gap-3 text-sm text-white/85' : 'flex items-center gap-3 text-sm text-muted-foreground'}>
                        <Check className="size-4 text-primary" />
                        {feature}
                    </div>
                ))}
            </div>

            <Button type="button" className="mt-auto w-full" variant={current ? 'outline' : 'default'} disabled={current} onClick={() => onSelect(plan)}>
                {current ? 'Current plan' : actionLabel}
            </Button>
        </article>
    );
}
