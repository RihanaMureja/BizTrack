import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, CreditCard } from 'lucide-react';
import { FormEvent } from 'react';
import type { ReactNode } from 'react';

type Payment = {
    id: number;
    payment_number: string;
    method: string;
    status: string;
    amount: string;
    reference: string | null;
    notes: string | null;
    paid_at: string | null;
    verified_at: string | null;
    sale: { invoice_number: string; grand_total: string; paid_amount: string; balance_due: string; payment_status: string };
    customer: { full_name: string } | null;
    user: { name: string } | null;
};
type VerifyStatus = { value: string; label: string };

export default function PaymentShow({ payment, verifyStatuses }: { payment: Payment; verifyStatuses: VerifyStatus[] }) {
    const form = useForm({ status: 'completed', reference: payment.reference ?? '', notes: payment.notes ?? '' });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/payments/${payment.id}/verify`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={payment.payment_number} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <CreditCard className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">{payment.payment_number}</h1>
                            <p className="text-sm text-muted-foreground">{payment.sale.invoice_number} | {payment.customer?.full_name ?? 'Walk-in customer'}</p>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/payments">
                            <ArrowLeft className="size-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
                    <section className="rounded-md border bg-card p-5 shadow-sm">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Info label="Amount" value={`${payment.amount} ETB`} />
                            <Info label="Status" value={<Badge>{payment.status}</Badge>} />
                            <Info label="Method" value={payment.method} />
                            <Info label="Reference" value={payment.reference ?? 'No reference'} />
                            <Info label="Recorded by" value={payment.user?.name ?? 'System'} />
                            <Info label="Verified at" value={payment.verified_at ?? 'Not verified'} />
                        </div>
                    </section>

                    <aside className="rounded-md border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">Sale balance</h2>
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span>Total</span><span>{payment.sale.grand_total} ETB</span></div>
                            <div className="flex justify-between"><span>Paid</span><span>{payment.sale.paid_amount} ETB</span></div>
                            <div className="flex justify-between border-t pt-2 font-semibold"><span>Due</span><span>{payment.sale.balance_due} ETB</span></div>
                        </div>
                    </aside>
                </div>

                {payment.status === 'pending' && (
                    <form onSubmit={submit} className="grid gap-4 rounded-md border bg-card p-5 shadow-sm lg:max-w-2xl">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-primary" />
                            <h2 className="font-semibold">Verify payment</h2>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-2 text-sm font-medium">
                                Status
                                <select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                                    {verifyStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                                </select>
                                {form.errors.status && <span className="text-xs text-destructive">{form.errors.status}</span>}
                            </label>
                            <label className="grid gap-2 text-sm font-medium">
                                Reference
                                <input value={form.data.reference} onChange={(event) => form.setData('reference', event.target.value)} className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                                {form.errors.reference && <span className="text-xs text-destructive">{form.errors.reference}</span>}
                            </label>
                        </div>
                        <label className="grid gap-2 text-sm font-medium">
                            Notes
                            <textarea value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} className="border-input bg-background min-h-24 rounded-md border px-3 py-2 text-sm" />
                            {form.errors.notes && <span className="text-xs text-destructive">{form.errors.notes}</span>}
                        </label>
                        <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving...' : 'Save verification'}</Button>
                    </form>
                )}
            </div>
        </>
    );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
            <div className="mt-1 text-sm font-medium">{value}</div>
        </div>
    );
}

PaymentShow.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Payments', href: '/payments' }, { title: 'Receipt', href: '#' }] };
