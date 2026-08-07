import { Badge } from '@/components/ui/badge';

type Batch = {
    id: number;
    batch_number: string;
    quantity_received: number;
    quantity_remaining: number;
    unit_cost: string;
    received_at: string | null;
    expiry_date: string | null;
};

function formatDate(value: string | null) {
    return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'Not set';
}

export function BatchBreakdownTable({ batches }: { batches: Batch[] }) {
    if (batches.length === 0) {
        return (
            <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm font-medium">No batches recorded yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Restocking this product will create the first lot record.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-md border">
            <div className="grid grid-cols-[1.3fr_.8fr_.8fr_.8fr_.9fr_.9fr] gap-3 bg-muted/60 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                <span>Batch</span>
                <span>Received</span>
                <span>Remaining</span>
                <span>Unit cost</span>
                <span>Received date</span>
                <span>Expiry</span>
            </div>
            {batches.map((batch) => (
                <div key={batch.id} className="grid grid-cols-[1.3fr_.8fr_.8fr_.8fr_.9fr_.9fr] gap-3 border-t px-4 py-3 text-sm">
                    <span className="font-medium">{batch.batch_number}</span>
                    <span>{batch.quantity_received}</span>
                    <span>
                        <Badge variant={batch.quantity_remaining > 0 ? 'default' : 'secondary'}>
                            {batch.quantity_remaining}
                        </Badge>
                    </span>
                    <span>{Number(batch.unit_cost).toFixed(2)}</span>
                    <span className="text-muted-foreground">{formatDate(batch.received_at)}</span>
                    <span className="text-muted-foreground">{formatDate(batch.expiry_date)}</span>
                </div>
            ))}
        </div>
    );
}
