import { RestockBatchForm } from '@/components/inventory/restock-batch-form';
import InputError from '@/components/input-error';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Barcode,
    Boxes,
    History,
    Layers3,
    PackageCheck,
    PackagePlus,
    SlidersHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
        current_unit_cost?: number | string | null;
        current_selling_price?: number | string | null;
        effective_selling_price?: number | string | null;
        is_discounted?: boolean;
        active_discount?: {
            price: number | null;
            percent: number | null;
            reason: string | null;
            allow_below_cost: boolean;
            insight_id: number | null;
        };
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

function AdjustmentForm({
    item,
    types,
    onSuccess,
}: {
    item: InventoryItem;
    types: Props['adjustmentTypes'];
    onSuccess: () => void;
}) {
    const form = useForm({
        type: 'adjustment',
        quantity: String(item.available_stock),
        notes: '',
    });

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
                <p className="text-sm text-muted-foreground">
                    Current stock: {item.available_stock}{' '}
                    {item.product.unit ?? 'units'}
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="adjust_type">Adjustment type</Label>
                <select
                    id="adjust_type"
                    value={form.data.type}
                    onChange={(event) =>
                        form.setData('type', event.target.value)
                    }
                    className="flex h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                >
                    {types.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
                <InputError message={form.errors.type} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="adjust_quantity">Quantity</Label>
                <Input
                    id="adjust_quantity"
                    type="number"
                    min="0"
                    value={form.data.quantity}
                    onChange={(event) =>
                        form.setData('quantity', event.target.value)
                    }
                    required
                />
                <InputError message={form.errors.quantity} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="adjust_notes">Notes</Label>
                <Input
                    id="adjust_notes"
                    value={form.data.notes}
                    onChange={(event) =>
                        form.setData('notes', event.target.value)
                    }
                    placeholder="Reason for stock change"
                />
                <InputError message={form.errors.notes} />
            </div>
            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? (
                    <Spinner />
                ) : (
                    <SlidersHorizontal className="size-4" />
                )}
                Save adjustment
            </Button>
        </form>
    );
}

export default function InventoryIndex({
    inventory,
    filters,
    adjustmentTypes,
}: Props) {
    const [restocking, setRestocking] = useState<InventoryItem | null>(null);
    const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);

    const updateFilters = (next: Partial<Props['filters']>) => {
        router.get(
            '/inventory',
            {
                search: filters.search ?? undefined,
                status: filters.status ?? undefined,
                ...next,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const totalAvailable =
        inventory?.data.reduce((sum, item) => sum + item.available_stock, 0) ??
        0;
    const lowStockCount =
        inventory?.data.filter(
            (item) =>
                item.available_stock > 0 &&
                item.available_stock <= item.product.reorder_level,
        ).length ?? 0;
    const outOfStockCount =
        inventory?.data.filter((item) => item.available_stock <= 0).length ?? 0;

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
                        <p className="text-sm text-muted-foreground">
                            Track stock levels, restocks, damages, returns, and
                            low-stock alerts.
                        </p>
                    </div>
                </div>

                {!inventory ? (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>Business profile required</AlertTitle>
                        <AlertDescription>
                            Set up your business profile before managing
                            inventory.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-col gap-4">
                        <section className="grid gap-3 md:grid-cols-3">
                            <InventoryMetric
                                label="Visible stock"
                                value={`${totalAvailable} units`}
                                icon={Boxes}
                            />
                            <InventoryMetric
                                label="Low stock"
                                value={String(lowStockCount)}
                                icon={AlertTriangle}
                            />
                            <InventoryMetric
                                label="Out of stock"
                                value={String(outOfStockCount)}
                                icon={PackageCheck}
                            />
                        </section>

                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
                            <SearchBox
                                defaultValue={filters.search ?? ''}
                                placeholder="Search products or barcodes..."
                                onSearch={(search) =>
                                    updateFilters({
                                        search: search || undefined,
                                    })
                                }
                            />
                            <select
                                value={filters.status ?? ''}
                                onChange={(event) =>
                                    updateFilters({
                                        status: event.target.value || undefined,
                                    })
                                }
                                className="flex h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                            >
                                <option value="">All stock</option>
                                <option value="low">Low stock</option>
                                <option value="out">Out of stock</option>
                            </select>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {inventory.data.map((item) => (
                                <InventoryCard
                                    key={item.id}
                                    item={item}
                                    onRestock={setRestocking}
                                    onAdjust={setAdjusting}
                                />
                            ))}
                        </div>
                        {inventory.data.length === 0 && (
                            <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
                                No inventory records found. Products create
                                inventory records automatically.
                            </div>
                        )}
                        <Pagination
                            links={inventory.links}
                            from={inventory.from}
                            to={inventory.to}
                            total={inventory.total}
                        />
                    </div>
                )}
            </div>

            <Dialog
                open={Boolean(restocking)}
                onOpenChange={(open) => !open && setRestocking(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Restock product</DialogTitle>
                    </DialogHeader>
                    {restocking && (
                        <RestockBatchForm
                            item={restocking}
                            onSuccess={() => setRestocking(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(adjusting)}
                onOpenChange={(open) => !open && setAdjusting(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust stock</DialogTitle>
                    </DialogHeader>
                    {adjusting && (
                        <AdjustmentForm
                            item={adjusting}
                            types={adjustmentTypes}
                            onSuccess={() => setAdjusting(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function InventoryMetric({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: LucideIcon;
}) {
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

function InventoryCard({
    item,
    onRestock,
    onAdjust,
}: {
    item: InventoryItem;
    onRestock: (item: InventoryItem) => void;
    onAdjust: (item: InventoryItem) => void;
}) {
    const stock = item.available_stock;
    const lowStock = stock > 0 && stock <= item.product.reorder_level;
    const outOfStock = stock <= 0;
    const stockTarget = Math.max(item.product.reorder_level * 2, stock, 1);
    const stockHealth = Math.min((stock / stockTarget) * 100, 100);
    const effectivePrice = Number(item.product.effective_selling_price ?? 0);
    const regularPrice = Number(item.product.current_selling_price ?? 0);
    const unitCost = Number(item.product.current_unit_cost ?? 0);

    return (
        <article className="rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className={
                            outOfStock
                                ? 'flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive'
                                : lowStock
                                  ? 'flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600'
                                  : 'flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary'
                        }
                    >
                        <PackageCheck className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                            {item.product.name}
                        </h3>
                        <p className="truncate text-xs text-muted-foreground">
                            {item.product.category?.name ?? 'Uncategorized'}
                        </p>
                    </div>
                </div>
                {outOfStock ? (
                    <Badge variant="destructive">Out</Badge>
                ) : lowStock ? (
                    <Badge variant="secondary">Low</Badge>
                ) : (
                    <Badge>Healthy</Badge>
                )}
            </div>

            <div className="mt-4 rounded-xl border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium">Stock health</p>
                    <p
                        className={
                            outOfStock
                                ? 'text-sm font-semibold text-destructive'
                                : lowStock
                                  ? 'text-sm font-semibold text-amber-600'
                                  : 'text-sm font-semibold text-primary'
                        }
                    >
                        {stock} {item.product.unit ?? 'units'}
                    </p>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-muted">
                    <div
                        className={
                            outOfStock
                                ? 'h-2.5 rounded-full bg-destructive'
                                : lowStock
                                  ? 'h-2.5 rounded-full bg-amber-500'
                                  : 'h-2.5 rounded-full bg-primary'
                        }
                        style={{ width: `${stockHealth}%` }}
                    />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                    <span>Reorder at {item.product.reorder_level}</span>
                    <span>
                        {outOfStock
                            ? 'Restock now'
                            : lowStock
                              ? 'Needs attention'
                              : 'Ready for sales'}
                    </span>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border bg-background p-3">
                    <p className="text-xs text-muted-foreground">
                        Sale price
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                        {effectivePrice > 0 ? `${effectivePrice.toLocaleString()} ETB` : 'No price'}
                    </p>
                    {item.product.is_discounted && (
                        <p className="mt-1 text-xs text-muted-foreground line-through">
                            {regularPrice.toLocaleString()} ETB
                        </p>
                    )}
                </div>
                <div className="rounded-xl border bg-background p-3">
                    <p className="text-xs text-muted-foreground">
                        Unit cost
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                        {unitCost > 0 ? `${unitCost.toLocaleString()} ETB` : 'No cost'}
                    </p>
                </div>
            </div>

            {item.product.is_discounted && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                    Active stagnant discount: {Number(item.product.active_discount?.percent ?? 0).toFixed(0)}% off
                    {item.product.active_discount?.allow_below_cost ? ' with below-cost override' : ''}
                </div>
            )}

            <div className="mt-4 flex min-w-0 items-center gap-2 rounded-full bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground">
                <Barcode className="size-4 shrink-0" />
                <span className="truncate">
                    {item.product.barcode ?? 'No barcode'}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => onRestock(item)}>
                    <PackagePlus className="size-4" />
                    Restock
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onAdjust(item)}
                >
                    <SlidersHorizontal className="size-4" />
                    Adjust
                </Button>
                <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={`/inventory/${item.id}/batches`}>
                        <Layers3 className="size-4" />
                        Batches
                    </Link>
                </Button>
                <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={`/inventory/${item.id}/transactions`}>
                        <History className="size-4" />
                        History
                    </Link>
                </Button>
            </div>
        </article>
    );
}

InventoryIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventory', href: '/inventory' },
    ],
};
