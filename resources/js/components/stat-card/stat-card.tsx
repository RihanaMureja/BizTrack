import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    label: string;
    value: string;
    trend?: string;
    icon: LucideIcon;
    tone?: 'emerald' | 'blue' | 'amber' | 'rose';
};

const tones = {
    emerald: {
        bg: 'from-emerald-500/10 to-emerald-500/5',
        icon: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        accent: 'bg-emerald-500',
        hover: 'hover:border-emerald-200 dark:hover:border-emerald-900',
    },
    blue: {
        bg: 'from-sky-500/10 to-sky-500/5',
        icon: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
        accent: 'bg-sky-500',
        hover: 'hover:border-sky-200 dark:hover:border-sky-900',
    },
    amber: {
        bg: 'from-amber-500/10 to-amber-500/5',
        icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        accent: 'bg-amber-500',
        hover: 'hover:border-amber-200 dark:hover:border-amber-900',
    },
    rose: {
        bg: 'from-rose-500/10 to-rose-500/5',
        icon: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
        accent: 'bg-rose-500',
        hover: 'hover:border-rose-200 dark:hover:border-rose-900',
    },
};

export function StatCard({ label, value, trend, icon: Icon, tone = 'emerald' }: Props) {
    const t = tones[tone];

    return (
        <article
            className={cn(
                'group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-card p-5 shadow-sm transition-all duration-300',
                t.hover,
                'hover:shadow-md hover:-translate-y-0.5',
            )}
        >
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', t.bg)} />
            <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
                </div>
                <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-lg', t.icon)}>
                    <Icon className="size-5" />
                </div>
            </div>
            <div className={cn('mt-4 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full', t.accent)} />
            {trend && (
                <p className="relative mt-3 text-xs text-muted-foreground/80">{trend}</p>
            )}
        </article>
    );
}
