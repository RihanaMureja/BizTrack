import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { PaymentReceiptModal } from '@/components/payments/payment-receipt-modal';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { CreditCard, Eye } from 'lucide-react';
import { useState } from 'react';

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

PaymentsIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Payments', href: '/payments' }] };
