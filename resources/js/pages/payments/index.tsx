import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { PaymentReceiptModal } from '@/components/payments/payment-receipt-modal';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { CreditCard, Eye, Receipt, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type Payment = {
    id: number;
    payment_number: string;
    method: string;
    status: string;
    amount: string;
    reference: string | null;
    created_at: string;
    sale: { invoice_number: string } | null;
    customer: { display_name: string } | null;
    user: { name: string } | null;
};
type Paginated<T> = { data: T[]; links: PaginationLink[]; from: number | null; to: number | null; total: number };
type Props = { payments: Paginated<Payment> | null; filters: { search: string | null } };

const statusVariant = (status: string) => {
    if (status === 'completed') return 'default';
    if (status === 'failed') return 'destructive';
    return 'secondary';
};

export default function PaymentsIndex({ payments, filters }: Props) {
    const [receiptPaymentId, setReceiptPaymentId] = useState<number | null>(null);
    const visiblePayments = payments?.data ?? [];
    const totalVisible = visiblePayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const completedCount = visiblePayments.filter((payment) => payment.status === 'completed').length;
    const pendingCount = visiblePayments.filter((payment) => payment.status === 'pending').length;
    const failedCount = visiblePayments.filter((payment) => payment.status === 'failed').length;
    const methodBreakdown = Object.values(
        visiblePayments.reduce<Record<string, { name: string; value: number }>>((groups, payment) => {
            groups[payment.method] ??= { name: payment.method, value: 0 };
            groups[payment.method].value += Number(payment.amount);
            return groups;
        }, {}),
    );
    const chartColors = ['var(--primary)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

    const columns: DataTableColumn<Payment>[] = [
        {
            key: 'payment_number',
            header: 'Payment',
            render: (payment) => (
                <div>
                    <button type="button" className="font-medium text-primary underline-offset-4 hover:underline" onClick={() => setReceiptPaymentId(payment.id)}>
                        {payment.payment_number}
                    </button>
                    <button type="button" className="block text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline" onClick={() => setReceiptPaymentId(payment.id)}>
                        {payment.sale?.invoice_number ?? 'No sale'}
                    </button>
                </div>
            ),
        },
        { key: 'customer', header: 'Customer', render: (payment) => payment.customer?.display_name ?? 'Walk-in customer' },
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
                            <p className="text-sm text-muted-foreground">Read-only payment ledger generated from checkout.</p>
                        </div>
                    </div>
                </div>

                {payments && (
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                            <section className="grid gap-3 md:grid-cols-3">
                                <PaymentMetric label="Visible received" value={`${totalVisible.toFixed(2)} ETB`} icon={WalletCards} />
                                <PaymentMetric label="Completed" value={String(completedCount)} icon={Receipt} />
                                <PaymentMetric label="Pending / failed" value={`${pendingCount} / ${failedCount}`} icon={CreditCard} />
                            </section>
                            <section className="rounded-xl border bg-card p-5 shadow-sm">
                                <h2 className="font-semibold">Method mix</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Breakdown from the visible payment ledger.</p>
                                {methodBreakdown.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={190}>
                                        <PieChart>
                                            <Pie data={methodBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={4}>
                                                {methodBreakdown.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="mt-4 rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">No payment methods yet.</div>
                                )}
                            </section>
                        </div>

                        <SearchBox
                            defaultValue={filters.search ?? ''}
                            placeholder="Search payment, reference, or invoice..."
                            onSearch={(search) => router.get('/payments', search ? { search } : {}, { preserveState: true, preserveScroll: true, replace: true })}
                        />
                        <DataTable columns={columns} data={payments.data} rowKey={(payment) => payment.id} emptyMessage="No payments yet. Payments will appear after POS checkout." />
                        <Pagination links={payments.links} from={payments.from} to={payments.to} total={payments.total} />
                    </div>
                )}
            </div>
            <PaymentReceiptModal paymentId={receiptPaymentId} open={receiptPaymentId !== null} onOpenChange={(open) => !open && setReceiptPaymentId(null)} />
        </>
    );
}

function PaymentMetric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CreditCard }) {
    return (
        <article className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
            </div>
        </article>
    );
}

PaymentsIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Payments', href: '/payments' }] };
