import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Clock3,
    Database,
    ExternalLink,
    HardDrive,
    Mail,
    PlayCircle,
    RefreshCw,
    Send,
    Server,
    Trash2,
    WalletCards,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { ReactNode } from 'react';

type Status = 'healthy' | 'degraded' | 'down';
type HealthCheck = {
    key: string;
    label: string;
    status: Status;
    description: string;
    detail: string;
    meta: Record<string, string | number | null>;
};
type Incident = {
    title: string;
    message: string;
    status: Status;
    priority: 'critical' | 'high' | 'normal';
    created_at: string;
};
type Props = {
    health: {
        status: Status;
        score: number;
        checked_at: string;
        current: { message: string; app: string };
        coreServices: HealthCheck[];
        gateways: HealthCheck[];
        backgroundJobs: {
            pending_count: number;
            failed_count: number;
            latest_failed_at: string | null;
            recent_failed: { id: number; queue: string; failed_at: string; summary: string }[];
        };
        charts: {
            uptime: { label: string; value: number }[];
            failedJobs: { label: string; value: number }[];
            gatewayOutcomes: { label: string; success: number; failed: number; pending: number }[];
            mailDelivery: { label: string; value: number }[];
        };
        incidents: Incident[];
        actions: {
            health: string;
            mail: string;
            clearFailedJobs: string;
            auditLogs: string;
        };
    };
};

const statusTone: Record<Status, string> = {
    healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200',
    degraded: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200',
    down: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200',
};
const iconMap: Record<string, typeof Activity> = {
    app: Server,
    database: Database,
    cache: Activity,
    queue: Clock3,
    mail: Mail,
    storage: HardDrive,
    scheduler: PlayCircle,
    telebirr: WalletCards,
    mpesa: WalletCards,
    cbebirr: WalletCards,
    apollo: WalletCards,
};

export default function AdminSystemHealth({ health }: Props) {
    const checkedAt = new Date(health.checked_at).toLocaleString();
    const statusLabel = health.status === 'healthy' ? 'Healthy' : health.status === 'degraded' ? 'Degraded' : 'Down';

    return (
        <>
            <Head title="System Health" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                            <Activity className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Platform operations</h1>
                            <p className="text-sm text-muted-foreground">Monitor core services, demo payment gateways, jobs, scheduler health, and recent incidents.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => router.post(health.actions.health, {}, { preserveScroll: true })}>
                            <RefreshCw className="size-4" />
                            Run health check
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.post(health.actions.mail, {}, { preserveScroll: true })}>
                            <Send className="size-4" />
                            Send test email
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={health.actions.auditLogs}>
                                <ExternalLink className="size-4" />
                                View audit logs
                            </Link>
                        </Button>
                    </div>
                </div>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <Badge variant="outline" className={statusTone[health.status]}>{statusLabel}</Badge>
                                <h2 className="mt-4 text-3xl font-semibold">{health.score}% platform score</h2>
                                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{health.current.message}</p>
                                <p className="mt-3 text-xs text-muted-foreground">Last checked {checkedAt}</p>
                            </div>
                            <div className="flex size-36 items-center justify-center rounded-full border bg-background shadow-inner">
                                <div className="text-center">
                                    <p className="text-4xl font-semibold">{health.score}</p>
                                    <p className="text-xs text-muted-foreground">score</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">Background jobs</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Queue pressure and failed job visibility.</p>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <MiniMetric label="Pending" value={health.backgroundJobs.pending_count.toLocaleString()} />
                            <MiniMetric label="Failed" value={health.backgroundJobs.failed_count.toLocaleString()} danger={health.backgroundJobs.failed_count > 0} />
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground">Latest failure: {health.backgroundJobs.latest_failed_at ?? 'None recorded'}</p>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4 w-full"
                            disabled={health.backgroundJobs.failed_count === 0}
                            onClick={() => router.post(health.actions.clearFailedJobs, {}, { preserveScroll: true })}
                        >
                            <Trash2 className="size-4" />
                            Clear failed jobs
                        </Button>
                    </div>
                </section>

                <section>
                    <SectionHeader title="Core services" description="Application infrastructure checks that affect every tenant." />
                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {health.coreServices.map((check) => <ServiceCard key={check.key} check={check} />)}
                    </div>
                </section>

                <section>
                    <SectionHeader title="Payment gateways" description="Demo gateway readiness now, real provider checks later through the same slots." />
                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {health.gateways.map((gateway) => (
                            <ServiceCard
                                key={gateway.key}
                                check={gateway}
                                actionLabel="Test gateway"
                                onAction={() => router.post(`/admin/system-health/gateways/${gateway.key}/test`, {}, { preserveScroll: true })}
                            />
                        ))}
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <ChartPanel title="24-hour health score" description="Snapshot history from recent platform checks.">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={health.charts.uptime}>
                                <defs>
                                    <linearGradient id="healthUptime" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.45} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.04} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} minTickGap={20} />
                                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={34} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="url(#healthUptime)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartPanel>

                    <ChartPanel title="Failed jobs trend" description="Hourly failed job volume over the last 24 hours.">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={health.charts.failedJobs}>
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} minTickGap={20} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={34} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="var(--primary)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartPanel>

                    <ChartPanel title="Gateway outcomes" description="Completed, failed, and pending payment records by method.">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={health.charts.gatewayOutcomes}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={34} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="success" radius={[6, 6, 0, 0]} fill="var(--primary)" />
                                <Bar dataKey="pending" radius={[6, 6, 0, 0]} fill="#f59e0b" />
                                <Bar dataKey="failed" radius={[6, 6, 0, 0]} fill="#dc2626" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartPanel>

                    <ChartPanel title="Mail readiness" description="Configuration and latest manual mail test state.">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={health.charts.mailDelivery}>
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 1]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={34} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartPanel>
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)]">
                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <SectionHeader title="Recent incidents" description="Current and recent degraded/down snapshots." />
                        <div className="mt-4 grid gap-3">
                            {health.incidents.length === 0 ? (
                                <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">No incidents recorded. The platform is quiet.</div>
                            ) : health.incidents.map((incident, index) => (
                                <div key={`${incident.title}-${index}`} className="flex gap-3 rounded-xl border bg-background p-4">
                                    <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${incident.status === 'down' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                                        <AlertTriangle className="size-4" />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-medium">{incident.title}</h3>
                                            <Badge variant="outline" className={statusTone[incident.status]}>{incident.priority}</Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">{incident.message}</p>
                                        <p className="mt-2 text-xs text-muted-foreground">{new Date(incident.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">Manual checks</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Operational actions for superadmin support.</p>
                        <div className="mt-5 grid gap-3">
                            <ActionButton icon={RefreshCw} label="Run health check now" onClick={() => router.post(health.actions.health, {}, { preserveScroll: true })} />
                            <ActionButton icon={Send} label="Send test email" onClick={() => router.post(health.actions.mail, {}, { preserveScroll: true })} />
                            {health.gateways.map((gateway) => (
                                <ActionButton key={gateway.key} icon={WalletCards} label={`Test ${gateway.label}`} onClick={() => router.post(`/admin/system-health/gateways/${gateway.key}/test`, {}, { preserveScroll: true })} />
                            ))}
                            <Button asChild variant="outline" className="justify-start">
                                <Link href={health.actions.auditLogs}>
                                    <ExternalLink className="size-4" />
                                    Open audit logs
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

AdminSystemHealth.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'System Health', href: '/admin/system-health' }] };

function SectionHeader({ title, description }: { title: string; description: string }) {
    return (
        <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function ServiceCard({ check, actionLabel, onAction }: { check: HealthCheck; actionLabel?: string; onAction?: () => void }) {
    const Icon = iconMap[check.key] ?? Activity;

    return (
        <article className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
                <Badge variant="outline" className={statusTone[check.status]}>{check.status}</Badge>
            </div>
            <h3 className="mt-4 font-semibold">{check.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{check.description}</p>
            <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{check.detail}</p>
            {actionLabel && onAction && (
                <Button type="button" variant="outline" size="sm" className="mt-4 w-full" onClick={onAction}>
                    <PlayCircle className="size-4" />
                    {actionLabel}
                </Button>
            )}
        </article>
    );
}

function MiniMetric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
    return (
        <div className="rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${danger ? 'text-red-600 dark:text-red-300' : ''}`}>{value}</p>
        </div>
    );
}

function ChartPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <SectionHeader title={title} description={description} />
            <div className="mt-5 h-72">{children}</div>
        </section>
    );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: typeof Activity; label: string; onClick: () => void }) {
    return (
        <Button type="button" variant="outline" className="justify-start" onClick={onClick}>
            <Icon className="size-4" />
            {label}
        </Button>
    );
}
