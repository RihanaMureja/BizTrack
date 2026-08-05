import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CreditCard, Eye, Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Payment = {
    id: number;
    payment_number: string;
    method: string;
    status: string;
    amount: string;
    reference: string | null;
    created_at: string;
    sale: { invoice_number: string } | null;
    customer: { full_name: string } | null;
    user: { name: string } | null;
};
type SaleOption = { id: number; invoice_number: string; grand_total: string; paid_amount: string; balance_due: string; payment_status: string };
type MethodOption = { value: string; label: string };
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = { payments: Paginated<Payment> | null; sales: SaleOption[]; methods: MethodOption[]; filters: { search: string | null } };

const statusVariant = (status: string) => {
    if (status === 'completed') return 'default';
    if (status === 'failed') return 'destructive';
    return 'secondary';
};

export default function PaymentsIndex({ payments, sales, methods, filters }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const form = useForm({ sale_id: '', amount: '', method: 'cash', reference: '', notes: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/payments', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setCreateOpen(false);
            },
        });
    };

    const columns: DataTableColumn<Payment>[] = [
        {
            key: 'payment_number',
            header: 'Payment',
            render: (payment) => (
                <div>
                    <Link className="font-medium underline" href={`/payments/${payment.id}`}>{payment.payment_number}</Link>
                    <p className="text-xs text-muted-foreground">{payment.sale?.invoice_number ?? 'No sale'}</p>
                </div>
            ),
        },
        { key: 'customer', header: 'Customer', render: (payment) => payment.customer?.full_name ?? 'Walk-in customer' },
        { key: 'amount', header: 'Amount', render: (payment) => `${payment.amount} ETB` },
        { key: 'method', header: 'Method', render: (payment) => payment.method },
        { key: 'status', header: 'Status', render: (payment) => <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge> },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (payment) => (
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/payments/${payment.id}`} aria-label={`View ${payment.payment_number}`}>
                        <Eye className="size-4" />
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <>
            <Head title="Payments" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <CreditCard className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Payments</h1>
                            <p className="text-sm text-muted-foreground">Record sale payments, track status, and verify digital transfers.</p>
                        </div>
                    </div>
                    {payments && (
                        <Button type="button" onClick={() => setCreateOpen(true)}>
                            <Plus className="size-4" />
                            Record payment
                        </Button>
                    )}
                </div>

                {payments && (
                    <div className="flex flex-col gap-4">
                        <SearchBox
                            defaultValue={filters.search ?? ''}
                            placeholder="Search payment, reference, or invoice..."
                            onSearch={(search) => router.get('/payments', search ? { search } : {}, { preserveState: true, preserveScroll: true, replace: true })}
                        />
                        <DataTable columns={columns} data={payments.data} rowKey={(payment) => payment.id} emptyMessage="No payments yet. Record a payment from an unpaid sale." />
                        <Pagination links={payments.links} from={payments.from} to={payments.to} total={payments.total} />
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Record payment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4">
                        <label className="grid gap-2 text-sm font-medium">
                            Sale
                            <select value={form.data.sale_id} onChange={(event) => {
                                const sale = sales.find((item) => String(item.id) === event.target.value);
                                form.setData((data) => ({ ...data, sale_id: event.target.value, amount: sale?.balance_due ?? data.amount }));
                            }} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                                <option value="">Choose sale</option>
                                {sales.map((sale) => (
                                    <option key={sale.id} value={sale.id}>{sale.invoice_number} | Due {sale.balance_due} ETB</option>
                                ))}
                            </select>
                            {form.errors.sale_id && <span className="text-xs text-destructive">{form.errors.sale_id}</span>}
                        </label>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-2 text-sm font-medium">
                                Amount
                                <input value={form.data.amount} onChange={(event) => form.setData('amount', event.target.value)} type="number" min="0.01" step="0.01" className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                                {form.errors.amount && <span className="text-xs text-destructive">{form.errors.amount}</span>}
                            </label>
                            <label className="grid gap-2 text-sm font-medium">
                                Method
                                <select value={form.data.method} onChange={(event) => form.setData('method', event.target.value)} className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                                    {methods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
                                </select>
                                {form.errors.method && <span className="text-xs text-destructive">{form.errors.method}</span>}
                            </label>
                        </div>
                        <label className="grid gap-2 text-sm font-medium">
                            Reference
                            <input value={form.data.reference} onChange={(event) => form.setData('reference', event.target.value)} className="border-input bg-background h-10 rounded-md border px-3 text-sm" placeholder="Bank slip, Telebirr, or Chapa reference" />
                            {form.errors.reference && <span className="text-xs text-destructive">{form.errors.reference}</span>}
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Notes
                            <textarea value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} className="border-input bg-background min-h-24 rounded-md border px-3 py-2 text-sm" />
                            {form.errors.notes && <span className="text-xs text-destructive">{form.errors.notes}</span>}
                        </label>
                        <Button type="submit" disabled={form.processing}>{form.processing ? 'Recording...' : 'Save payment'}</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

PaymentsIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Payments', href: '/payments' }] };
