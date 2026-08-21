import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type AdminPoint = {
    label: string;
    value: number;
    amount?: number;
    count?: number;
};

const palette = ['var(--primary)', '#0f766e', '#f59e0b', '#2563eb', '#be185d', '#64748b'];

export function AdminAreaPanel({ title, description, data }: { title: string; description: string; data: AdminPoint[] }) {
    return (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="adminAreaGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.45} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.04} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} minTickGap={20} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={34} />
                        <Tooltip cursor={{ stroke: 'var(--primary)', strokeOpacity: 0.25 }} />
                        <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="url(#adminAreaGradient)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}

export function AdminDonutPanel({ title, description, data }: { title: string; description: string; data: AdminPoint[] }) {
    const total = data.reduce((sum, point) => sum + point.value, 0);

    return (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
                <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                                {data.map((point, index) => (
                                    <Cell key={point.label} fill={palette[index % palette.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid content-center gap-2">
                    {data.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No data yet.</p>
                    ) : data.map((point, index) => (
                        <div key={point.label} className="flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2 text-sm">
                            <span className="flex min-w-0 items-center gap-2">
                                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                                <span className="truncate">{point.label}</span>
                            </span>
                            <Badge variant="secondary">{total > 0 ? Math.round((point.value / total) * 100) : 0}%</Badge>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function AdminRankedBars({ title, description, data, valueSuffix = '' }: { title: string; description: string; data: AdminPoint[]; valueSuffix?: string }) {
    const max = Math.max(...data.map((point) => point.value), 1);

    return (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="mt-5 grid gap-3">
                {data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No ranking data yet.</p>
                ) : data.map((point, index) => (
                    <div key={point.label} className="rounded-xl border bg-background p-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium">{point.label}</span>
                            <span className="text-muted-foreground">{point.value.toLocaleString()} {valueSuffix}</span>
                        </div>
                        <div className="mt-3 h-2.5 rounded-full bg-muted">
                            <div
                                className="h-2.5 rounded-full"
                                style={{
                                    width: `${Math.max((point.value / max) * 100, point.value > 0 ? 6 : 0)}%`,
                                    backgroundColor: palette[index % palette.length],
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function AdminGatewayGrid({ data }: { data: AdminPoint[] }) {
    const gateways = data.length > 0 ? data : [
        { label: 'Telebirr', value: 0, amount: 0 },
        { label: 'CBE Birr', value: 0, amount: 0 },
        { label: 'M-Pesa', value: 0, amount: 0 },
        { label: 'Apollo', value: 0, amount: 0 },
    ];

    return (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div>
                <h2 className="font-semibold">Payment gateway mix</h2>
                <p className="mt-1 text-sm text-muted-foreground">Demo and checkout gateway usage across the platform.</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {gateways.map((gateway, index) => (
                    <div key={gateway.label} className="rounded-2xl border bg-background p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex size-10 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: palette[index % palette.length] }}>
                                {gateway.label.slice(0, 2).toUpperCase()}
                            </div>
                            <Badge variant="secondary">{gateway.value.toLocaleString()} txns</Badge>
                        </div>
                        <p className="mt-4 font-semibold">{gateway.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{Number(gateway.amount ?? 0).toLocaleString()} ETB processed</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function AdminBarPanel({ title, description, data, icon: Icon }: { title: string; description: string; data: AdminPoint[]; icon: LucideIcon }) {
    return (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
            </div>
            <div className="mt-5 h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={34} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {data.map((point, index) => (
                                <Cell key={point.label} fill={palette[index % palette.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
