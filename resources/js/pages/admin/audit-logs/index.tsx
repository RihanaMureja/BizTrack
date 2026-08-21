import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router } from '@inertiajs/react';
import { BarChart3, Eye, PieChart, ScrollText, ShieldAlert, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type AuditLog = {
    id: number;
    action: string;
    action_group: string;
    action_group_label: string;
    risk_level: 'normal' | 'important' | 'sensitive' | 'critical';
    risk_label: string;
    table_name: string | null;
    record_id: number | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
    business: { id: number; business_name: string; business_category: string | null; business_category_label: string; business_type: string | null } | null;
    user: { id: number; first_name: string | null; last_name: string | null; name: string; email: string; role: string; role_label: string } | null;
};
type Option = { value: string; label: string };
type BusinessOption = { id: number; name: string; category: string | null };
type UserOption = { id: number; name: string; email: string; role: string };
type VisualPoint = { label: string; value: number };
type Filters = {
    search: string | null;
    action: string | null;
    date_from: string | null;
    date_to: string | null;
    business_id: number | null;
    business_category: string | null;
    user_id: number | null;
    role: string | null;
    action_group: string | null;
    table_name: string | null;
    risk_level: string | null;
};
type QuickFilter = { label: string; params: Partial<Filters> };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    auditLogs: Paginated<AuditLog>;
    actions: string[];
    isSuperAdmin: boolean;
    businesses: BusinessOption[];
    businessCategories: Option[];
    users: UserOption[];
    roles: Option[];
    tables: string[];
    actionGroups: Option[];
    riskLevels: Option[];
    quickFilters: QuickFilter[];
    visuals: { dailyTrend: VisualPoint[]; moduleMix: VisualPoint[]; businessMix: VisualPoint[]; riskMix: VisualPoint[] } | null;
    filters: Filters;
};

const riskClass: Record<AuditLog['risk_level'], string> = {
    normal: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200',
    important: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200',
    sensitive: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200',
    critical: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200',
};
const palette = ['var(--primary)', '#0f766e', '#f59e0b', '#2563eb', '#dc2626', '#64748b'];

export default function AuditLogsIndex(props: Props) {
    const { auditLogs, actions, isSuperAdmin, businesses, businessCategories, users, roles, tables, actionGroups, riskLevels, quickFilters, visuals, filters } = props;
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const applyFilters = (next: Partial<Filters>) => {
        router.get('/admin/audit-logs', {
            search: filters.search ?? '',
            action: filters.action ?? '',
            date_from: filters.date_from ?? '',
            date_to: filters.date_to ?? '',
            business_id: filters.business_id ?? '',
            business_category: filters.business_category ?? '',
            user_id: filters.user_id ?? '',
            role: filters.role ?? '',
            action_group: filters.action_group ?? '',
            table_name: filters.table_name ?? '',
            risk_level: filters.risk_level ?? '',
            ...next,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const columns: DataTableColumn<AuditLog>[] = [
        {
            key: 'action',
            header: 'Activity',
            render: (log) => (
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{log.action}</p>
                        <Badge variant="secondary">{log.action_group_label}</Badge>
                        <Badge variant="outline" className={riskClass[log.risk_level]}>{log.risk_label}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{log.table_name ?? 'platform'} · Record {log.record_id ?? 'n/a'} · {log.ip_address ?? 'No IP captured'}</p>
                </div>
            ),
        },
        {
            key: 'user',
            header: 'Actor',
            render: (log) => {
                const name = [log.user?.first_name, log.user?.last_name].filter(Boolean).join(' ') || log.user?.name;

                return (
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{name || 'System'}</p>
                            {log.user?.role_label && <Badge variant="outline">{log.user.role_label}</Badge>}
                        </div>
                        {log.user?.email && <p className="text-xs text-muted-foreground">{log.user.email}</p>}
                    </div>
                );
            },
        },
        {
            key: 'business',
            header: 'Business',
            render: (log) => (
                <div>
                    <p className="font-medium">{log.business?.business_name ?? 'Platform'}</p>
                    {log.business && <p className="text-xs text-muted-foreground">{log.business.business_category_label}</p>}
                </div>
            ),
        },
        { key: 'created_at', header: 'Created' },
        {
            key: 'id',
            header: '',
            className: 'text-right',
            render: (log) => (
                <Button type="button" variant="outline" size="icon" aria-label="View details" title="View details" onClick={() => setSelectedLog(log)}>
                    <Eye className="size-4" />
                </Button>
            ),
        },
    ];

    return (
        <>
            <Head title={isSuperAdmin ? 'Audit Explorer' : 'Audit Logs'} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                            <ScrollText className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">{isSuperAdmin ? 'Audit Explorer' : 'Audit Logs'}</h1>
                            <p className="text-sm text-muted-foreground">
                                {isSuperAdmin ? 'Investigate who did what, which business was affected, and whether the change was sensitive.' : 'Track important sign-ins, sales, payments, products, expenses, and system changes.'}
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary">{auditLogs.total} records</Badge>
                </div>

                {isSuperAdmin && visuals && (
                    <>
                        <section className="grid gap-3 lg:grid-cols-4">
                            <VisualCard icon={TrendingUp} title="Daily activity" data={visuals.dailyTrend} type="area" />
                            <VisualCard icon={BarChart3} title="Top modules" data={visuals.moduleMix} type="bar" />
                            <VisualCard icon={PieChart} title="Risk mix" data={visuals.riskMix} type="pie" />
                            <VisualCard icon={ShieldAlert} title="Top businesses" data={visuals.businessMix} type="bar" />
                        </section>

                        <section className="flex flex-wrap gap-2">
                            {quickFilters.map((quick) => (
                                <Button key={quick.label} type="button" variant="outline" size="sm" onClick={() => applyFilters(quick.params)}>
                                    {quick.label}
                                </Button>
                            ))}
                            <Button type="button" variant="ghost" size="sm" onClick={() => applyFilters({ search: '', action: '', date_from: '', date_to: '', business_id: null, business_category: '', user_id: null, role: '', action_group: '', table_name: '', risk_level: '' })}>
                                Clear filters
                            </Button>
                        </section>
                    </>
                )}

                <div className={`grid gap-3 rounded-2xl border bg-card p-4 shadow-sm ${isSuperAdmin ? 'xl:grid-cols-4' : 'lg:grid-cols-[minmax(0,1fr)_14rem_10rem_10rem]'}`}>
                    <SearchBox defaultValue={filters.search ?? ''} placeholder="Search users, businesses, actions..." onSearch={(search) => applyFilters({ search })} className="relative w-full" />
                    <SelectField value={filters.action ?? ''} onChange={(action) => applyFilters({ action })} options={actions.map((action) => ({ value: action, label: action }))} placeholder="All actions" />
                    <input type="date" value={filters.date_from ?? ''} onChange={(event) => applyFilters({ date_from: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                    <input type="date" value={filters.date_to ?? ''} onChange={(event) => applyFilters({ date_to: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />

                    {isSuperAdmin && (
                        <>
                            <SelectField value={filters.business_id ? String(filters.business_id) : ''} onChange={(business_id) => applyFilters({ business_id: business_id ? Number(business_id) : null })} options={businesses.map((business) => ({ value: String(business.id), label: business.name }))} placeholder="All businesses" />
                            <SelectField value={filters.business_category ?? ''} onChange={(business_category) => applyFilters({ business_category })} options={businessCategories} placeholder="All business types" />
                            <SelectField value={filters.user_id ? String(filters.user_id) : ''} onChange={(user_id) => applyFilters({ user_id: user_id ? Number(user_id) : null })} options={users.map((user) => ({ value: String(user.id), label: `${user.name} (${user.email})` }))} placeholder="All actors" />
                            <SelectField value={filters.role ?? ''} onChange={(role) => applyFilters({ role })} options={roles} placeholder="All account types" />
                            <SelectField value={filters.action_group ?? ''} onChange={(action_group) => applyFilters({ action_group })} options={actionGroups} placeholder="All action groups" />
                            <SelectField value={filters.table_name ?? ''} onChange={(table_name) => applyFilters({ table_name })} options={tables.map((table) => ({ value: table, label: table }))} placeholder="All modules" />
                            <SelectField value={filters.risk_level ?? ''} onChange={(risk_level) => applyFilters({ risk_level })} options={riskLevels} placeholder="All risk levels" />
                        </>
                    )}
                </div>

                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                    <DataTable columns={columns} data={auditLogs.data} rowKey={(log) => log.id} emptyMessage="No audit logs match the current filters." />
                    <div className="mt-4">
                        <Pagination links={auditLogs.links} from={auditLogs.from} to={auditLogs.to} total={auditLogs.total} />
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Audit log details</DialogTitle>
                        <DialogDescription>Review the exact values captured for this activity.</DialogDescription>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="grid gap-4">
                            <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-2">
                                <Detail label="Action" value={selectedLog.action} />
                                <Detail label="Risk" value={selectedLog.risk_label} />
                                <Detail label="Module" value={selectedLog.table_name ?? 'Platform'} />
                                <Detail label="Record" value={selectedLog.record_id ? String(selectedLog.record_id) : 'n/a'} />
                                <Detail label="Actor" value={selectedLog.user?.email ?? 'System'} />
                                <Detail label="Business" value={selectedLog.business?.business_name ?? 'Platform'} />
                                <Detail label="IP address" value={selectedLog.ip_address ?? 'Not captured'} />
                                <Detail label="Created" value={selectedLog.created_at} />
                            </div>
                            <ValueBlock title="Old values" values={selectedLog.old_values} />
                            <ValueBlock title="New values" values={selectedLog.new_values} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

AuditLogsIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Audit Logs', href: '/admin/audit-logs' }] };

function SelectField({ value, onChange, options, placeholder }: { value: string; onChange: (value: string) => void; options: Option[]; placeholder: string }) {
    return (
        <select value={value} onChange={(event) => onChange(event.target.value)} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
            <option value="">{placeholder}</option>
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
    );
}

function VisualCard({ icon: Icon, title, data, type }: { icon: typeof ScrollText; title: string; data: VisualPoint[]; type: 'area' | 'bar' | 'pie' }) {
    return (
        <article className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{title}</h2>
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                </div>
            </div>
            <div className="mt-4 h-40">
                <ResponsiveContainer width="100%" height="100%">
                    {type === 'area' ? (
                        <AreaChart data={data}>
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} minTickGap={18} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={28} />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="var(--primary)" fillOpacity={0.16} />
                        </AreaChart>
                    ) : type === 'bar' ? (
                        <BarChart data={data}>
                            <XAxis dataKey="label" hide />
                            <YAxis hide />
                            <Tooltip />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {data.map((point, index) => <Cell key={point.label} fill={palette[index % palette.length]} />)}
                            </Bar>
                        </BarChart>
                    ) : (
                        <RechartsPieChart>
                            <Pie data={data} dataKey="value" innerRadius={42} outerRadius={64} paddingAngle={3}>
                                {data.map((point, index) => <Cell key={point.label} fill={palette[index % palette.length]} />)}
                            </Pie>
                            <Tooltip />
                        </RechartsPieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </article>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm">{value}</p>
        </div>
    );
}

function ValueBlock({ title, values }: { title: string; values: Record<string, unknown> | null }) {
    return (
        <section className="rounded-xl border bg-background p-4">
            <h3 className="font-semibold">{title}</h3>
            <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-muted/40 p-3 text-xs">{values ? JSON.stringify(values, null, 2) : 'No values captured.'}</pre>
        </section>
    );
}
