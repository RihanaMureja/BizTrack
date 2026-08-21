import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    Building2,
    Check,
    CheckCheck,
    ExternalLink,
    ShieldAlert,
    Trash2,
} from 'lucide-react';

type PlatformNotification = {
    id: number;
    title: string;
    message: string;
    type: string;
    type_label: string;
    category: string | null;
    category_label: string;
    priority: 'critical' | 'high' | 'normal';
    priority_label: string;
    is_read: boolean;
    action_url: string | null;
    business: { id: number; name: string } | null;
    related_user: { id: number; name: string; email: string } | null;
    created_at: string;
};

type Option = { value: string; label: string };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    notifications: Paginated<PlatformNotification>;
    unreadCount: number;
    categories: Option[];
    priorities: Option[];
    filters: { search: string | null; category: string | null; priority: string | null; read: boolean | null };
};

const priorityClass: Record<PlatformNotification['priority'], string> = {
    critical: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200',
    high: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200',
    normal: 'border-primary/20 bg-primary/10 text-primary',
};

export default function AdminNotificationsIndex({ notifications, unreadCount, categories, priorities, filters }: Props) {
    const applyFilters = (next: Record<string, string | boolean | null>) => {
        router.get('/admin/notifications', {
            search: filters.search ?? '',
            category: filters.category ?? '',
            priority: filters.priority ?? '',
            read: filters.read === null ? '' : String(filters.read),
            ...next,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const criticalCount = notifications.data.filter((notification) => notification.priority === 'critical' && !notification.is_read).length;
    const highCount = notifications.data.filter((notification) => notification.priority === 'high' && !notification.is_read).length;

    return (
        <>
            <Head title="Platform Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                            <Bell className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Platform notifications</h1>
                            <p className="text-sm text-muted-foreground">High-signal alerts for businesses, revenue, security, system health, and support.</p>
                        </div>
                    </div>
                    <Button type="button" variant="outline" onClick={() => router.post('/admin/notifications/mark-all-read', {}, { preserveScroll: true })} disabled={unreadCount === 0}>
                        <CheckCheck className="size-4" />
                        Mark all read
                    </Button>
                </div>

                <section className="grid gap-3 md:grid-cols-3">
                    <MetricCard icon={Bell} label="Unread alerts" value={unreadCount.toLocaleString()} helper="Across the platform center" />
                    <MetricCard icon={AlertTriangle} label="High priority" value={highCount.toLocaleString()} helper="Visible in current filter" tone="amber" />
                    <MetricCard icon={ShieldAlert} label="Critical" value={criticalCount.toLocaleString()} helper="Immediate attention items" tone="red" />
                </section>

                <section className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_12rem_12rem_10rem]">
                    <SearchBox defaultValue={filters.search ?? ''} placeholder="Search platform notifications..." onSearch={(search) => applyFilters({ search })} />
                    <select value={filters.category ?? ''} onChange={(event) => applyFilters({ category: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                        <option value="">All categories</option>
                        {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                    </select>
                    <select value={filters.priority ?? ''} onChange={(event) => applyFilters({ priority: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                        <option value="">All priorities</option>
                        {priorities.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
                    </select>
                    <select value={filters.read === null ? '' : String(filters.read)} onChange={(event) => applyFilters({ read: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                        <option value="">All</option>
                        <option value="false">Unread</option>
                        <option value="true">Read</option>
                    </select>
                </section>

                <section className="grid gap-3">
                    {notifications.data.length === 0 ? (
                        <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Bell className="size-6" />
                            </div>
                            <h2 className="mt-4 font-semibold">No platform notifications found</h2>
                            <p className="mt-1 text-sm text-muted-foreground">When something important needs attention, it will appear here.</p>
                        </div>
                    ) : notifications.data.map((notification) => (
                        <article key={notification.id} className={`rounded-2xl border bg-card p-4 shadow-sm transition ${notification.is_read ? 'opacity-75' : 'ring-1 ring-primary/15'}`}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {!notification.is_read && <Badge>New</Badge>}
                                        <Badge variant="outline" className={priorityClass[notification.priority]}>{notification.priority_label}</Badge>
                                        <Badge variant="secondary">{notification.category_label}</Badge>
                                    </div>
                                    <h2 className="mt-3 text-lg font-semibold">{notification.title}</h2>
                                    <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{notification.message}</p>

                                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <span>{notification.created_at}</span>
                                        {notification.business && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                                                <Building2 className="size-3" />
                                                {notification.business.name}
                                            </span>
                                        )}
                                        {notification.related_user && (
                                            <span className="rounded-full bg-muted px-2 py-1">{notification.related_user.email}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                                    {notification.action_url && (
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={notification.action_url}>
                                                <ExternalLink className="size-4" />
                                                Open
                                            </Link>
                                        </Button>
                                    )}
                                    {!notification.is_read && (
                                        <Button type="button" variant="outline" size="icon" aria-label="Mark read" title="Mark read" onClick={() => router.post(`/admin/notifications/${notification.id}/read`, {}, { preserveScroll: true })}>
                                            <Check className="size-4" />
                                        </Button>
                                    )}
                                    <Button type="button" variant="outline" size="icon" aria-label="Dismiss" title="Dismiss" onClick={() => router.post(`/admin/notifications/${notification.id}/dismiss`, {}, { preserveScroll: true })}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                <Pagination links={notifications.links} from={notifications.from} to={notifications.to} total={notifications.total} />
            </div>
        </>
    );
}

AdminNotificationsIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Notifications', href: '/admin/notifications' }] };

function MetricCard({ icon: Icon, label, value, helper, tone = 'primary' }: { icon: typeof Bell; label: string; value: string; helper: string; tone?: 'primary' | 'amber' | 'red' }) {
    const iconClass = tone === 'red'
        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300'
        : tone === 'amber'
            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
            : 'bg-primary/10 text-primary';

    return (
        <article className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-semibold">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
                </div>
                <div className={`flex size-10 items-center justify-center rounded-xl ${iconClass}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </article>
    );
}
