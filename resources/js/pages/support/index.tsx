import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { Clock3, LifeBuoy, Mail, Send } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

type SupportMessage = {
    id: number;
    subject: string;
    message: string;
    status: string;
    status_label: string;
    created_at: string;
};

type Props = {
    contact: {
        full_name: string;
        email: string;
        phone: string | null;
        business: string | null;
    };
    messages: SupportMessage[];
};

export default function SupportIndex({ contact, messages }: Props) {
    const form = useForm({
        full_name: contact.full_name ?? '',
        email: contact.email ?? '',
        phone: contact.phone ?? '',
        subject: '',
        message: '',
        website: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/support', {
            preserveScroll: true,
            onSuccess: () => form.reset('subject', 'message', 'website'),
        });
    };

    return (
        <>
            <Head title="Support" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                        <LifeBuoy className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
                        <p className="text-sm text-muted-foreground">Contact the BizTrack platform team for business-owner support.</p>
                    </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <form onSubmit={submit} className="rounded-2xl border bg-card p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold">Send a support request</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Include what happened, what page you were on, and what you expected to happen.</p>
                            </div>
                            {contact.business && <Badge variant="secondary">{contact.business}</Badge>}
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <Field label="Full name" error={form.errors.full_name}>
                                <Input value={form.data.full_name} onChange={(event) => form.setData('full_name', event.target.value)} />
                            </Field>
                            <Field label="Email" error={form.errors.email}>
                                <Input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
                            </Field>
                            <Field label="Phone" error={form.errors.phone}>
                                <Input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} placeholder="Optional" />
                            </Field>
                            <Field label="Subject" error={form.errors.subject}>
                                <Input value={form.data.subject} onChange={(event) => form.setData('subject', event.target.value)} placeholder="Example: Payment checkout issue" />
                            </Field>
                        </div>

                        <div className="mt-4">
                            <Field label="Message" error={form.errors.message}>
                                <textarea
                                    value={form.data.message}
                                    onChange={(event) => form.setData('message', event.target.value)}
                                    className="border-input bg-background min-h-36 w-full rounded-md border px-3 py-2 text-sm"
                                    placeholder="Write the details here..."
                                />
                            </Field>
                        </div>
                        <input type="text" tabIndex={-1} autoComplete="off" value={form.data.website} onChange={(event) => form.setData('website', event.target.value)} className="hidden" />

                        <div className="mt-5 flex items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">Support requests go directly to the superadmin Inbox.</p>
                            <Button type="submit" disabled={form.processing}>
                                <Send className="size-4" />
                                Send request
                            </Button>
                        </div>
                    </form>

                    <aside className="rounded-2xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Clock3 className="size-5 text-primary" />
                            <h2 className="font-semibold">Recent requests</h2>
                        </div>
                        <div className="mt-4 grid gap-3">
                            {messages.length === 0 ? (
                                <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">Your support history will appear here after you send a request.</p>
                            ) : messages.map((message) => (
                                <article key={message.id} className="rounded-xl border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-medium">{message.subject}</h3>
                                        <Badge variant={message.status === 'resolved' ? 'secondary' : 'default'}>{message.status_label}</Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">{message.message}</p>
                                    <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" /> {message.created_at}</p>
                                </article>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}

SupportIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Support', href: '/support' }] };

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="grid gap-2">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </label>
    );
}
