import { Check, Sparkles } from 'lucide-react';
import type { DemoPaymentPlan } from '@/components/subscriptions/demo-plan-payment-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
    plan: DemoPaymentPlan;
    current?: boolean;
    featured?: boolean;
    actionLabel?: string;
    readOnly?: boolean;
    onSelect?: (plan: DemoPaymentPlan) => void;
};

export function PlanSelectionCard({ plan, current = false, featured = false, actionLabel = 'Choose plan', readOnly = false, onSelect }: Props) {
    const price = Number(plan.price);
    const isFree = price === 0;

    const features = [
        plan.max_cashiers === 1
            ? '1 cashier seat'
            : `Up to ${plan.max_cashiers} cashier seats`,
        'Monthly billing',
        'Sales & inventory',
        'Staff permissions',
    ];

    return (
        <article
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                current && 'border-primary/40 ring-1 ring-primary/20',
                featured && !current && 'border-primary/30 ring-1 ring-primary/10',
            )}
        >
            {/* Top accent strip */}
            <div
                className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-1',
                    current
                        ? 'bg-primary'
                        : featured
                          ? 'bg-gradient-to-r from-primary via-emerald-400 to-primary'
                          : 'bg-border/50',
                )}
            />

            {/* Subtle glow for featured */}
            {featured && (
                <div className="pointer-events-none absolute -right-12 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            )}

            <div className="relative flex flex-1 flex-col gap-3">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {featured && !current && (
                        <Badge className="gap-1 bg-primary py-0.5 text-[10px] text-primary-foreground">
                            <Sparkles className="size-2.5" />
                            Recommended
                        </Badge>
                    )}
                    {current && (
                        <Badge variant="outline" className="border-primary/25 bg-primary/10 py-0.5 text-[10px] text-primary">
                            Current plan
                        </Badge>
                    )}
                    <Badge variant="secondary" className="py-0.5 text-[10px] uppercase tracking-wider">
                        {plan.duration_months}-mo billing
                    </Badge>
                </div>

                {/* Plan name + price */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold leading-tight tracking-tight">{plan.name}</h3>
                        {plan.description && (
                            <p className="mt-0.5 text-xs leading-5 text-muted-foreground line-clamp-2">
                                {plan.description}
                            </p>
                        )}
                    </div>
                    <div className="shrink-0 text-right">
                        <div className="flex items-baseline justify-end gap-0.5">
                            <span className="text-xl font-semibold tracking-tight">
                                {isFree ? 'Free' : price.toLocaleString()}
                            </span>
                            {!isFree && <span className="text-[11px] font-medium text-muted-foreground">ETB</span>}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">/ month</p>
                    </div>
                </div>

                {/* Features list */}
                <div className="flex-1 rounded-xl border bg-muted/30 px-3 py-2.5">
                    <ul className="grid gap-1.5">
                        {features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-xs leading-5">
                                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Check className="size-2.5" />
                                </span>
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action */}
                {readOnly ? (
                    <div className="mt-auto flex items-center justify-between rounded-xl border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                        <span>Plan details</span>
                        <span className="font-medium text-foreground">{plan.max_cashiers} cashier{plan.max_cashiers !== 1 ? 's' : ''}</span>
                    </div>
                ) : (
                    <Button
                        type="button"
                        size="sm"
                        className={cn('mt-auto w-full', current && 'shadow-none')}
                        variant={current ? 'outline' : 'default'}
                        disabled={current}
                        onClick={() => onSelect?.(plan)}
                    >
                        {current ? 'Current plan' : actionLabel}
                    </Button>
                )}
            </div>
        </article>
    );
}
