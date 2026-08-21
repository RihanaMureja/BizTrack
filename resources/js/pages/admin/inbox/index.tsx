import { Pagination, type PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router } from '@inertiajs/react';
import { Check, Inbox, LifeBuoy, Mail, MessageSquareText, Store, UserRound } from 'lucide-react';
import { useState } from 'react';

type Message = {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    source: string;
    source_label: string;
    status: 'new' | 'read' | 'resolved';
    status_label: string;
    ip_address: string | null;
    created_at: string;
    business: { id: number; name: string; category: string | null } | null;
    user: { id: number; name: string; email: string } | null;
};

type Option = { value: string; label: string };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = {
    messages: Paginated<Message>;
    summary: { total: number; new: number; owner_support: number };
    statuses: Option[];
    sources: Option[];
    filters: { search: string | null; status: string | null; source: string | null };
};

const statusClass: Record<Message['status'], string> = {
    new: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200',
    read: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200',
    resolved: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200',
};

export default function AdminInboxIndex({ messages, summary, statuses, sources, filters }: Props) {
    const [selected, setSelected] = useState<Message | null>(null);
    const applyFilters = (next: Partial<Props['filters']>) => {
        router.get('/admin/inbox', {
            search: filters.search ?? '',
            status: filters.status ?? '',
            source: filters.source ?? '',
            ...next,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title="Inbox" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                            <Inbox className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
                            <p className="text-sm text-muted-foreground">Contact messages from landing visitors and business owners.</p>
                        </div>
                    </div>
                    <Badge variant="secondary">{messages.total} messages</Badge>
                </div>

                <section className="grid gap-3 md:grid-cols-3">
                    <Metric icon={Inbox} label="All messages" value={summary.total} />
                    <Metric icon={Mail} label="New" value={summary.new} />
                    <Metric icon={LifeBuoy} label="Owner support" value={summary.owner_support} />
                </section>

                <section className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
                    <SearchBox defaultValue={filters.search ?? ''} placeholder="Search sender, subject, message, business..." onSearch={(search) => applyFilters({ search })} />
                    <select value={filters.status ?? ''} onChange={(event) => applyFilters({ status: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                        <option value="">All statuses</option>
                        {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                    </select>
                    <select value={filters.source ?? ''} onChange={(event) => applyFilters({ source: event.target.value })} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                        <option value="">All sources</option>
                        {sources.map((source) => <option key={source.value} value={source.value}>{source.label}</option>)}
                    </select>
                </section>

                <section className="grid gap-3">
                    {messages.data.length === 0 ? (
                        <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
                            <Inbox className="mx-auto size-10 text-primary" />
                            <h2 className="mt-4 font-semibold">No inbox messages found</h2>
                            <p className="mt-1 text-sm text-muted-foreground">New contact and support messages will appear here.</p>
                        </div>
                    ) : messages.data.map((message) => (
                        <article key={message.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className={statusClass[message.status]}>{message.status_label}</Badge>
                                        <Badge variant="secondary">{message.source_label}</Badge>
                                        {message.business && <Badge variant="outline">{message.business.name}</Badge>}
                                    </div>
                                    <h2 className="mt-3 text-lg font-semibold">{message.subject}</h2>
                                    <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{message.message}</p>
                                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1"><UserRound className="size-3" /> {message.full_name} · {message.email}</span>
                                        {message.business && <span className="inline-flex items-center gap-1"><Store className="size-3" /> {message.business.category ?? 'Business'}</span>}
                                        <span>{message.created_at}</span>
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setSelected(message)}>
                                        <MessageSquareText className="size-4" />
                                        View
                                    </Button>
                                    {message.status === 'new' && (
                                        <Button type="button" variant="outline" size="icon" title="Mark read" aria-label="Mark read" onClick={() => router.post(`/admin/inbox/${message.id}/read`, {}, { preserveScroll: true })}>
                                            <Check className="size-4" />
                                        </Button>
                                    )}
                                    {message.status !== 'resolved' && (
                                        <Button type="button" size="sm" onClick={() => router.post(`/admin/inbox/${message.id}/resolve`, {}, { preserveScroll: true })}>
                                            Resolve
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                <Pagination links={messages.links} from={messages.from} to={messages.to} total={messages.total} />
            </div>

            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selected?.subject ?? 'Contact message'}</DialogTitle>
                        <DialogDescription>Full contact/support message details.</DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <div className="grid gap-4">
                            <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
                                <Detail label="Name" value={selected.full_name} />
                                <Detail label="Email" value={selected.email} />
                                <Detail label="Phone" value={selected.phone ?? 'Not provided'} />
                                <Detail label="Source" value={selected.source_label} />
                                <Detail label="Business" value={selected.business?.name ?? 'Public visitor'} />
                                <Detail label="Submitted" value={selected.created_at} />
                            </div>
                            <div className="rounded-xl border p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{selected.message}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminInboxIndex.layout = { breadcrumbs: [{ title: 'Super Admin', href: '/admin' }, { title: 'Inbox', href: '/admin/inbox' }] };

function Metric({ icon: Icon, label, value }: { icon: typeof Inbox; label: string; value: number }) {
    return (
        <article className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-semibold">{value.toLocaleString()}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
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
