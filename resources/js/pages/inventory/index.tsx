import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import InputError from '@/components/input-error';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, Boxes, History, PackagePlus, SlidersHorizontal } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

type InventoryItem = {
    id: number;
    quantity: number;
    available_stock: number;
    product: {
        id: number;
        name: string;
        barcode: string | null;
        unit: string | null;
        reorder_level: number;
        category: { name: string } | null;
    };
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    inventory: Paginated<InventoryItem> | null;
    filters: {
        search: string | null;
        status: string | null;
    };
    adjustmentTypes: Array<{ value: string; label: string }>;
};

function RestockForm({ item, onSuccess }: { item: InventoryItem; onSuccess: () => void }) {
    const form = useForm({ quantity: '1', notes: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/inventory/${item.id}/restock`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onSuccess();
            },
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-4">
            <div>
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">Current stock: {item.available_stock} {item.product.unit ?? 'units'}</p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="restock_quantity">Quantity to add</Label>
                <Input id="restock_quantity" type="number" min="1" value={form.data.quantity} onChange={(event) => form.setData('quantity', event.target.value)} required />
                <InputError message={form.errors.quantity} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="restock_notes">Notes</Label>
                <Input id="restock_notes" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} placeholder="Supplier, delivery note, or reason" />
                <InputError message={form.errors.notes} />
            </div>
            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <PackagePlus className="size-4" />}
                Restock
            </Button>
        </form>
    );
}

function AdjustmentForm({ item, types, onSuccess }: { item: InventoryItem; types: Props['adjustmentTypes']; onSuccess: () => void }) {
    const form = useForm({ type: 'adjustment', quantity: String(item.available_stock), notes: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/inventory/${item.id}/adjust`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onSuccess();
            },
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-4">
            <div>
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">Current stock: {item.available_stock} {item.product.unit ?? 'units'}</p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="adjust_type">Adjustment type</Label>
                <select id="adjust_type" value={form.data.type} onChange={(event) => form.setData('type', event.target.value)} className="border-input bg-background flex h-9 rounded-md border px-3 text-sm shadow-xs">
                    {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
                <InputError message={form.errors.type} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="adjust_quantity">Quantity</Label>
                <Input id="adjust_quantity" type="number" min="0" value={form.data.quantity} onChange={(event) => form.setData('quantity', event.target.value)} required />
                <InputError message={form.errors.quantity} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="adjust_notes">Notes</Label>
                <Input id="adjust_notes" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} placeholder="Reason for stock change" />
                <InputError message={form.errors.notes} />
            </div>
            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <SlidersHorizontal className="size-4" />}
                Save adjustment
            </Button>
        </form>
    );
}

export default function InventoryIndex({ inventory, filters, adjustmentTypes }: Props) {
    const [restocking, setRestocking] = useState<InventoryItem | null>(null);
    const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);

    const updateFilters = (next: Partial<Props['filters']>) => {
        router.get('/inventory', {
            search: filters.search ?? undefined,
            status: filters.status ?? undefined,
            ...next,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const columns: DataTableColumn<InventoryItem>[] = [
        {
            key: 'product',
            header: 'Product',
            render: (item) => (
                <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{item.product.category?.name ?? 'Uncategorized'} | {item.product.barcode ?? 'No barcode'}</p>
                </div>
            ),
        },
        {
            key: 'available_stock',
            header: 'Available',
            render: (item) => <span className="font-semibold">{item.available_stock} {item.product.unit ?? 'units'}</span>,
        },
        {
            key: 'reorder',
            header: 'Reorder level',
            render: (item) => item.product.reorder_level,
        },
        {
            key: 'status',
            header: 'Status',
            render: (item) => item.available_stock <= 0
                ? <Badge variant="destructive">Out of stock</Badge>
                : item.available_stock <= item.product.reorder_level
                    ? <Badge variant="secondary">Low stock</Badge>
                    : <Badge variant="default">Healthy</Badge>,
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (item) => (
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setRestocking(item)}>
                        <PackagePlus className="size-4" />
                        Restock
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setAdjusting(item)}>
                        <SlidersHorizontal className="size-4" />
                        Adjust
                    </Button>
                    <Button type="button" variant="outline" size="icon" asChild>
                        <Link href={`/inventory/${item.id}/transactions`} aria-label={`View ${item.product.name} history`}>
                            <History className="size-4" />
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <Boxes className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Inventory</h1>
                        <p className="text-sm text-muted-foreground">Track stock levels, restocks, damages, returns, and low-stock alerts.</p>
                    </div>
                </div>

                {!inventory ? (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>Business profile required</AlertTitle>
                        <AlertDescription>Set up your business profile before managing inventory.</AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
                            <SearchBox defaultValue={filters.search ?? ''} placeholder="Search products or barcodes..." onSearch={(search) => updateFilters({ search: search || undefined })} />
                            <select value={filters.status ?? ''} onChange={(event) => updateFilters({ status: event.target.value || undefined })} className="border-input bg-background flex h-10 rounded-md border px-3 text-sm shadow-xs">
                                <option value="">All stock</option>
                                <option value="low">Low stock</option>
                                <option value="out">Out of stock</option>
                            </select>
                        </div>
                        <DataTable columns={columns} data={inventory.data} rowKey={(item) => item.id} emptyMessage="No inventory records found. Products create inventory records automatically." />
                        <Pagination links={inventory.links} from={inventory.from} to={inventory.to} total={inventory.total} />
                    </div>
                )}
            </div>

            <Dialog open={Boolean(restocking)} onOpenChange={(open) => !open && setRestocking(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Restock product</DialogTitle></DialogHeader>
                    {restocking && <RestockForm item={restocking} onSuccess={() => setRestocking(null)} />}
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(adjusting)} onOpenChange={(open) => !open && setAdjusting(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Adjust stock</DialogTitle></DialogHeader>
                    {adjusting && <AdjustmentForm item={adjusting} types={adjustmentTypes} onSuccess={() => setAdjusting(null)} />}
                </DialogContent>
            </Dialog>
        </>
    );
}

InventoryIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventory', href: '/inventory' },
    ],
};
