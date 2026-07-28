import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type Props = {
    label: string;
    value: string;
    trend?: string;
    icon: LucideIcon;
    tone?: 'emerald' | 'blue' | 'amber' | 'rose';
};

const tones = {
    emerald: 'bg-primary/10 text-primary',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

export function StatCard({ label, value, trend, icon: Icon, tone = 'emerald' }: Props) {
    return (
        <article className="rounded-md border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
                </div>
                <div className={cn('flex size-10 items-center justify-center rounded-md', tones[tone])}>
                    <Icon className="size-5" />
                </div>
            </div>
            {trend && <p className="mt-4 text-xs text-muted-foreground">{trend}</p>}
        </article>
    );
}
