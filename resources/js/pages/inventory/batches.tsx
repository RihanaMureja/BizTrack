import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Layers } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDisplayDate } from '@/lib/date';

type Batch = {
    id: number;
    batch_number: string;
    quantity: number;
    remaining_quantity: number;
    unit_cost: string;
    received_at: string;
    expires_at: string | null;
    notes: string | null;
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
    summary: {
        total_received: number;
        total_remaining: number;
    };
    batches: {
        data: Batch[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
};

const formatEtb = (value: number) =>
    `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;

export default function InventoryBatches({
    inventory,
    summary,
    batches,
}: Props) {
    const columns: DataTableColumn<Batch>[] = [
        {
            key: 'batch_number',
            header: 'Batch Number',
            render: (batch) => (
                <span className="font-mono text-xs font-medium">
                    {batch.batch_number}
                </span>
            ),
        },
        {
            key: 'quantity',
            header: 'Quantity',
            render: (batch) => batch.quantity.toLocaleString(),
        },
        {
            key: 'unit_cost',
            header: 'Unit Cost',
            render: (batch) => formatEtb(Number(batch.unit_cost)),
        },
        {
            key: 'value',
            header: 'Batch Value',
            render: (batch) =>
                formatEtb(Number(batch.unit_cost) * batch.quantity),
        },
        {
            key: 'received_at',
            header: 'Restock Date',
            render: (batch) => formatDisplayDate(batch.received_at),
        },
        {
            key: 'expires_at',
            header: 'Expiry Date',
            render: (batch) => formatDisplayDate(batch.expires_at),
        },
        {
            key: 'notes',
            header: 'Notes',
            render: (batch) =>
                batch.notes ? (
                    <span className="text-muted-foreground">{batch.notes}</span>
                ) : (
                    <span className="text-muted-foreground/50">—</span>
                ),
        },
        {
            key: 'remaining_quantity',
            header: 'Remaining',
            render: (batch) => (
                <span>
                    {batch.remaining_quantity.toLocaleString()}{' '}
                    {batch.remaining_quantity === 0 && (
                        <Badge variant="secondary">Depleted</Badge>
                    )}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title={`${inventory.product.name} Batches`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <Layers className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">
                                {inventory.product.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Inventory batches (FIFO). Each restock creates a
                                new batch.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/inventory">
                            <ArrowLeft className="size-4" />
                            Back to inventory
                        </Link>
                    </Button>
                </div>

                <section className="grid gap-3 rounded-md border bg-card p-4 shadow-sm md:grid-cols-3">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Available stock
                        </p>
                        <p className="text-lg font-semibold">
                            {inventory.available_stock.toLocaleString()} units
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Units received
                        </p>
                        <p className="text-lg font-semibold">
                            {summary.total_received.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Units remaining in batches
                        </p>
                        <p className="text-lg font-semibold">
                            {summary.total_remaining.toLocaleString()}
                        </p>
                    </div>
                </section>

                <DataTable
                    columns={columns}
                    data={batches.data}
                    rowKey={(batch) => batch.id}
                    emptyMessage="No batches recorded yet. Restock this product to create the first batch."
                />
                <Pagination
                    links={batches.links}
                    from={batches.from}
                    to={batches.to}
                    total={batches.total}
                />
            </div>
        </>
    );
}

InventoryBatches.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventory', href: '/inventory' },
        { title: 'Batches', href: '#' },
    ],
};
