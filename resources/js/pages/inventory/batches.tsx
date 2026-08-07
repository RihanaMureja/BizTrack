import { BatchBreakdownTable } from '@/components/inventory/batch-breakdown-table';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Boxes } from 'lucide-react';

type Batch = {
    id: number;
    batch_number: string;
    quantity_received: number;
    quantity_remaining: number;
    unit_cost: string;
    received_at: string | null;
    expiry_date: string | null;
};

type Props = {
    inventory: {
        id: number;
        available_stock: number;
        product: {
            name: string;
            unit: string | null;
            category: { name: string } | null;
        };
    };
    batches: {
        data: Batch[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
};

export default function InventoryBatches({ inventory, batches }: Props) {
    return (
        <>
            <Head title={`${inventory.product.name} Batches`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <Boxes className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">{inventory.product.name} batches</h1>
                            <p className="text-sm text-muted-foreground">
                                {inventory.available_stock} {inventory.product.unit ?? 'units'} available from FIFO lots.
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

                <BatchBreakdownTable batches={batches.data} />
                <Pagination links={batches.links} from={batches.from} to={batches.to} total={batches.total} />
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
