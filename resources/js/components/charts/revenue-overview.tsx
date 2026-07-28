type Point = {
    label: string;
    value: number;
};

type Props = {
    title: string;
    description: string;
    data: Point[];
};

export function RevenueOverview({ title, description, data }: Props) {
    const max = Math.max(...data.map((point) => point.value), 1);

    return (
        <section className="rounded-md border bg-card p-5 shadow-sm">
            <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>

            <div className="mt-6 flex h-48 items-end gap-3">
                {data.map((point) => (
                    <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex h-36 w-full items-end rounded-md bg-muted">
                            <div
                                className="w-full rounded-md bg-primary transition-all"
                                style={{ height: `${Math.max((point.value / max) * 100, point.value > 0 ? 8 : 2)}%` }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">{point.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
