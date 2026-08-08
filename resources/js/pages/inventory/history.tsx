import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, History } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Transaction = {
    id: number;
    type: string;
    quantity_change: number;
    quantity_before: number;
    quantity_after: number;
    notes: string | null;
    created_at: string;
    user: { name: string } | null;
};

type Props = {
    inventory: {
        id: number;
        available_stock: number;
        product: {
            name: string;
            category: { name: string } | null;
        };
    };
    transactions: {
        data: Transaction[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
};

export default function InventoryHistory({ inventory, transactions }: Props) {
    const columns: DataTableColumn<Transaction>[] = [
        { key: 'type', header: 'Type', render: (transaction) => <Badge variant="secondary">{transaction.type}</Badge> },
        { key: 'quantity_change', header: 'Change', render: (transaction) => transaction.quantity_change > 0 ? `+${transaction.quantity_change}` : transaction.quantity_change },
        { key: 'quantity_before', header: 'Before' },
        { key: 'quantity_after', header: 'After' },
        { key: 'notes', header: 'Notes', render: (transaction) => <span className="text-muted-foreground">{transaction.notes ?? 'No notes'}</span> },
        { key: 'user', header: 'By', render: (transaction) => transaction.user?.name ?? 'System' },
    ];

    return (
        <>
            <Head title={`${inventory.product.name} History`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <History className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">{inventory.product.name}</h1>
                            <p className="text-sm text-muted-foreground">Inventory movement history for this product.</p>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/inventory">
                            <ArrowLeft className="size-4" />
                            Back to inventory
                        </Link>
                    </Button>
                </div>
                <DataTable columns={columns} data={transactions.data} rowKey={(transaction) => transaction.id} emptyMessage="No inventory movements recorded yet." />
                <Pagination links={transactions.links} from={transactions.from} to={transactions.to} total={transactions.total} />
            </div>
        </>
    );
}

InventoryHistory.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventory', href: '/inventory' },
        { title: 'History', href: '#' },
    ],
};
