import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, Receipt } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { PageHeader } from '@/components/page-header/page-header';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Sale = { id: number; invoice_number: string; grand_total: string; status: string; payment_status: string; sold_at: string; customer: { full_name: string } | null; user: { name: string } | null };
type Props = { sales: { data: Sale[]; links: PaginationLink[]; from: number | null; to: number | null; total: number } | null; filters: { search: string | null } };

const successBadge = (label: string) => (
    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 capitalize !text-emerald-600 dark:!text-emerald-400">{label}</Badge>
);

const warningBadge = (label: string) => (
    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 capitalize !text-amber-600 dark:!text-amber-400">{label}</Badge>
);

const saleStatusBadge = (status: string) => {
    if (status === 'draft') {
return <Badge variant="secondary" className="capitalize">{status}</Badge>;
}

    if (status === 'cancelled') {
return <Badge variant="destructive" className="capitalize">{status}</Badge>;
}

    return successBadge(status);
};

const paymentStatusBadge = (status: string) => {
    if (status === 'partial' || status === 'unpaid') {
return warningBadge(status);
}

    if (status === 'pending') {
return <Badge variant="secondary" className="capitalize">{status}</Badge>;
}

    if (status === 'overdue' || status === 'failed') {
return <Badge variant="destructive" className="capitalize">{status}</Badge>;
}

    return successBadge(status);
};

export default function SalesIndex({ sales, filters }: Props) {
    const columns: DataTableColumn<Sale>[] = [
        { key: 'invoice_number', header: 'Invoice', render: (sale) => <Link className="font-medium underline" href={`/sales/${sale.id}`}>{sale.invoice_number}</Link> },
        { key: 'customer', header: 'Customer', render: (sale) => sale.customer?.full_name ?? 'Walk-in customer' },
        { key: 'grand_total', header: 'Total', render: (sale) => `${sale.grand_total} ETB` },
        { key: 'status', header: 'Status', render: (sale) => saleStatusBadge(sale.status) },
        { key: 'payment_status', header: 'Payment', render: (sale) => paymentStatusBadge(sale.payment_status) },
        { key: 'user', header: 'Sold by', render: (sale) => sale.user?.name ?? 'System' },
        { key: 'actions', header: '', className: 'text-right', render: (sale) => <Button variant="ghost" size="sm" asChild><Link href={`/sales/${sale.id}`}><Eye className="size-4" />View</Link></Button> },
    ];

    return (
        <>
            <Head title="Sales" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <PageHeader
                    title="Sales"
                    description="Review invoices and open the POS workspace."
                    icon={Receipt}
                    actions={<Button asChild><Link href="/sales/pos"><Plus className="size-4" />New sale</Link></Button>}
                />
                {sales && (
                    <div className="flex flex-col gap-4">
                        <SearchBox defaultValue={filters.search ?? ''} placeholder="Search invoice..." onSearch={(search) => router.get('/sales', search ? { search } : {}, { preserveState: true, preserveScroll: true, replace: true })} />
                        <DataTable columns={columns} data={sales.data} rowKey={(sale) => sale.id} emptyMessage="No sales yet. Open POS to complete the first sale." />
                        <Pagination links={sales.links} from={sales.from} to={sales.to} total={sales.total} />
                    </div>
                )}
            </div>
        </>
    );
}

SalesIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Sales', href: '/sales' }] };
