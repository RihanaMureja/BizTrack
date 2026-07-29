import { cn } from '@/lib/utils';

type Point = {
    label: string;
    value: number;
};

type Props = {
    title: string;
    description: string;
    data: Point[];
};

const barTones = [
    'bg-gradient-to-t from-emerald-500 to-emerald-400',
    'bg-gradient-to-t from-sky-500 to-sky-400',
    'bg-gradient-to-t from-violet-500 to-violet-400',
    'bg-gradient-to-t from-amber-500 to-amber-400',
    'bg-gradient-to-t from-rose-500 to-rose-400',
    'bg-gradient-to-t from-cyan-500 to-cyan-400',
    'bg-gradient-to-t from-emerald-500 to-emerald-400',
];

export function RevenueOverview({ title, description, data }: Props) {
    const max = Math.max(...data.map((point) => point.value), 1);
    const hasData = data.some((d) => d.value > 0);

    return (
        <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold">{title}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                </div>
                {hasData && (
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {data.reduce((s, p) => s + p.value, 0).toLocaleString()} total
                    </span>
                )}
            </div>

            <div className="mt-8 flex h-52 items-end gap-2 md:gap-3">
                {data.map((point, i) => {
                    const height = point.value > 0 ? Math.max((point.value / max) * 100, 4) : 4;

                    return (
                        <div key={point.label} className="group relative flex flex-1 flex-col items-center gap-2">
                            <span className="absolute -top-6 rounded bg-popover px-1.5 py-0.5 text-xs font-medium text-popover-foreground opacity-0 shadow-sm transition-all group-hover:opacity-100">
                                {point.value.toLocaleString()}
                            </span>
                            <div className="flex h-44 w-full items-end rounded-lg bg-muted/50">
                                <div
                                    className={cn(
                                        'w-full rounded-lg transition-all duration-500',
                                        barTones[i % barTones.length],
                                    )}
                                    style={{ height: `${height}%` }}
                                />
                            </div>
                            <span className={cn(
                                'text-[11px] font-medium transition-colors',
                                point.value > 0 ? 'text-muted-foreground' : 'text-muted-foreground/40',
                            )}>
                                {point.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {!hasData && (
                <p className="mt-4 text-center text-xs text-muted-foreground/60">
                    Data will appear as transactions are recorded
                </p>
            )}
        </section>
    );
}
