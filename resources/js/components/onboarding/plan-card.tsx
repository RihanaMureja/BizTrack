import { router } from '@inertiajs/react';
import { Check } from 'lucide-react';

type Plan = {
    id: number;
    name: string;
    price: string | number;
    duration_months: number;
    max_cashiers: number;
    description?: string | null;
};

export function PlanCard({ plan }: { plan: Plan }) {
    const price = Number(plan.price);
    const accent = plan.name.toLowerCase().includes('pro')
        ? 'from-cyan-500/25 via-cyan-950/30 to-black border-cyan-300/35'
        : plan.name.toLowerCase().includes('growth')
            ? 'from-indigo-500/25 via-indigo-950/30 to-black border-indigo-300/35'
            : 'from-fuchsia-500/25 via-fuchsia-950/30 to-black border-fuchsia-300/35';
    const features = [
        `${plan.max_cashiers} employees included`,
        `${plan.duration_months} month billing period`,
        'Sales, inventory, customers, and reports',
        'Role-based employee permissions',
    ];

    return (
        <div className={`flex min-h-[23rem] flex-col rounded-md border bg-gradient-to-b ${accent} p-5 shadow-xl shadow-black/30`}>
            <div>
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    <div className="text-right">
                        <p className="text-xl font-semibold text-white">{price.toLocaleString()} ETB</p>
                        <p className="text-xs text-white/55">per month</p>
                    </div>
                </div>
                <p className="mt-4 min-h-12 text-sm leading-5 text-white/70">{plan.description ?? 'A practical plan for growing business operations.'}</p>
                <button
                    type="button"
                    onClick={() => router.post(`/onboarding/plans/${plan.id}`)}
                    className="mt-5 h-10 w-full rounded-md border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition hover:border-emerald-300/50 hover:bg-emerald-300/15"
                >
                    Get Started
                </button>
            </div>
            <div className="mt-7">
                <p className="text-sm font-semibold text-white">Includes</p>
            </div>
            <div className="mt-4 grid gap-3">
                {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-white/85">
                        <Check className="size-4 text-emerald-300" />
                        {feature}
                    </div>
                ))}
            </div>
        </div>
    );
}
