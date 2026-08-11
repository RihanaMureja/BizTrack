import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ReceiptText } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Item = { id: number; quantity: number; unit_price: string; line_total: string; product: { name: string } };
type Sale = { invoice_number: string; subtotal: string; tax_amount: string; discount_amount: string; grand_total: string; status: string; payment_status: string; paid_amount: string; balance_due: string; sold_at: string; customer: { full_name: string } | null; user: { name: string } | null; items: Item[] };

const saleStatusBadge = (status: string) => {
    if (status === 'draft') {
return <Badge variant="secondary" className="capitalize">{status}</Badge>;
}

    if (status === 'cancelled') {
return <Badge variant="destructive" className="capitalize">{status}</Badge>;
}

    return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 capitalize !text-emerald-600 dark:!text-emerald-400">{status}</Badge>;
};

const paymentStatusBadge = (status: string) => {
    if (status === 'partial' || status === 'unpaid') {
return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 capitalize !text-amber-600 dark:!text-amber-400">{status}</Badge>;
}

    if (status === 'pending') {
return <Badge variant="secondary" className="capitalize">{status}</Badge>;
}

    if (status === 'overdue' || status === 'failed') {
return <Badge variant="destructive" className="capitalize">{status}</Badge>;
}

    return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 capitalize !text-emerald-600 dark:!text-emerald-400">{status}</Badge>;
};

export default function SaleShow({ sale }: { sale: Sale }) {
    return (
        <>
            <Head title={sale.invoice_number} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <ReceiptText className="size-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold">{sale.invoice_number}</h1>
                                {saleStatusBadge(sale.status)}
                                {paymentStatusBadge(sale.payment_status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {sale.customer?.full_name ?? 'Walk-in customer'} | {sale.user?.name ?? 'System'}
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href="/sales">
                            <ArrowLeft className="size-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="min-w-0 flex-1">
                        <DataTable
                            columns={[
                                { key: 'product', header: 'Product', render: (item) => item.product.name },
                                { key: 'quantity', header: 'Qty' },
                                { key: 'unit_price', header: 'Price', render: (item) => `${item.unit_price} ETB` },
                                { key: 'line_total', header: 'Total', render: (item) => `${item.line_total} ETB` },
                            ]}
                            data={sale.items}
                            rowKey={(item) => item.id}
                        />
                    </div>

                    <div className="w-full max-w-sm space-y-4 md:w-64">
                        <div className="rounded-md border bg-card p-4 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{sale.subtotal} ETB</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{sale.tax_amount} ETB</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>{sale.discount_amount} ETB</span>
                            </div>
                            <div className="mt-3 flex justify-between border-t pt-3 text-lg font-semibold">
                                <span>Total</span>
                                <span>{sale.grand_total} ETB</span>
                            </div>
                        </div>

                        <div className="rounded-md border bg-card p-4 text-sm">
                            <h2 className="mb-3 font-semibold">Payment</h2>
                            <div className="flex justify-between">
                                <span>Amount paid</span>
                                <span>{sale.paid_amount} ETB</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Balance due</span>
                                <span className={cn({ 'text-destructive': Number(sale.balance_due) > 0 })}>{sale.balance_due} ETB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

SaleShow.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Sales', href: '/sales' }, { title: 'Receipt', href: '#' }] };
