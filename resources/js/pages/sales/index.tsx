import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Receipt } from 'lucide-react';

type Sale = { id: number; invoice_number: string; grand_total: string; status: string; sold_at: string; customer: { full_name: string } | null; user: { name: string } | null };
type Props = { sales: { data: Sale[]; links: PaginationLink[]; from: number | null; to: number | null; total: number } | null; filters: { search: string | null } };

export default function SalesIndex({ sales, filters }: Props) {
    const columns: DataTableColumn<Sale>[] = [
        { key: 'invoice_number', header: 'Invoice', render: (sale) => <Link className="font-medium underline" href={`/sales/${sale.id}`}>{sale.invoice_number}</Link> },
        { key: 'customer', header: 'Customer', render: (sale) => sale.customer?.full_name ?? 'Walk-in customer' },
        { key: 'grand_total', header: 'Total', render: (sale) => `${sale.grand_total} ETB` },
        { key: 'status', header: 'Status' },
        { key: 'user', header: 'Sold by', render: (sale) => sale.user?.name ?? 'System' },
    ];

    return (
        <>
            <Head title="Sales" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><Receipt className="size-5" /></div>
                        <div><h1 className="text-xl font-semibold">Sales</h1><p className="text-sm text-muted-foreground">Review invoices and open the POS workspace.</p></div>
                    </div>
                    <Button asChild><Link href="/sales/pos"><Plus className="size-4" />New sale</Link></Button>
                </div>
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
