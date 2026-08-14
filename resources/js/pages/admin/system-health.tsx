import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Props = {
    health: {
        message: string;
        data: { app?: string; status?: string };
        meta: Record<string, unknown>;
        checked_at: string;
        endpoint: string;
    };
};

export default function AdminSystemHealth({ health }: Props) {
    const status = (health.data?.status ?? '').toLowerCase();
    const badge = status === 'ok' ? 'healthy' : status ? 'degraded' : undefined;

    return (
        <>
            <Head title="System Health" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <Activity className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">System Health</h1>
                        <p className="text-sm text-muted-foreground">This page surfaces the same API health payload exposed by the existing health controller.</p>
                    </div>
                </div>

                <section className="grid gap-4 rounded-md border bg-card p-4 shadow-sm md:grid-cols-3">
                    <HealthCard label="Status" value={health.data?.status ?? 'unknown'} badge={badge} />
                    <HealthCard label="Application" value={health.data?.app ?? 'BizTrack'} />
                    <HealthCard label="Checked at" value={new Date(health.checked_at).toLocaleString()} />
                </section>

                <section className="rounded-md border bg-card p-4 shadow-sm">
                    <h2 className="font-semibold">Health payload</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{health.message}</p>
                    <dl className="mt-4 grid gap-4 md:grid-cols-2">
                        <Detail label="Endpoint" value={health.endpoint} />
                        <Detail label="Status" value={health.data?.status ?? 'unknown'} />
                        <Detail label="App" value={health.data?.app ?? 'BizTrack'} />
                        <Detail label="Meta" value={Object.keys(health.meta).length ? JSON.stringify(health.meta, null, 2) : 'No meta payload'} monospace />
                    </dl>
                </section>
            </div>
        </>
    );
}

AdminSystemHealth.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'System Health', href: '/admin/system-health' }] };

function HealthCard({ label, value, badge }: { label: string; value: string; badge?: string }) {
    return (
        <article className="rounded-md border bg-background p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="mt-2 flex items-center gap-2">
                <p className="text-xl font-semibold">{value}</p>
                {badge && <Badge variant={badge === 'healthy' ? 'default' : 'secondary'}>{badge}</Badge>}
            </div>
        </article>
    );
}

function Detail({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) {
    return (
        <div className="rounded-md border bg-muted/20 p-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className={monospace ? 'mt-1 whitespace-pre-wrap font-mono text-sm' : 'mt-1 text-sm'}>{value}</dd>
        </div>
    );
}
