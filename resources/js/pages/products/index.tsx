import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Boxes, Pencil, Plus, Power, ScanBarcode } from 'lucide-react';
import { useState } from 'react';
import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { ProductForm } from '@/components/forms/product-form';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { ProductCard } from '@/components/product-card/product-card';
import { SearchBox } from '@/components/search-box/search-box';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    category_id: number | null;
    name: string;
    barcode: string | null;
    description: string | null;
    buy_price: string;
    selling_price: string;
    unit: string | null;
    reorder_level: number;
    status: string;
    category: Category | null;
    inventory: {
        quantity: number;
        available_stock: number;
    } | null;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    products: Paginated<Product> | null;
    categories: Category[];
    filters: {
        search: string | null;
        category_id: number | null;
        status: string | null;
    };
    statuses: Array<{ value: string; label: string }>;
};

export default function ProductsIndex({ products, categories, filters, statuses }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deactivatingProduct, setDeactivatingProduct] = useState<Product | null>(null);
    const [deactivating, setDeactivating] = useState(false);

    const updateFilters = (next: Partial<Props['filters']>) => {
        const params = {
            search: filters.search ?? undefined,
            category_id: filters.category_id ?? undefined,
            status: filters.status ?? undefined,
            ...next,
        };

        router.get('/products', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const confirmDeactivate = () => {
        if (!deactivatingProduct) {
            return;
        }

        setDeactivating(true);
        router.delete(`/products/${deactivatingProduct.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeactivating(false);
                setDeactivatingProduct(null);
            },
        });
    };

    const columns: DataTableColumn<Product>[] = [
        {
            key: 'name',
            header: 'Product',
            render: (product) => (
                <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category?.name ?? 'Uncategorized'}</p>
                </div>
            ),
        },
        {
            key: 'barcode',
            header: 'Barcode',
            render: (product) => (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <ScanBarcode className="size-4" />
                    {product.barcode || 'No barcode'}
                </span>
            ),
        },
        {
            key: 'prices',
            header: 'Prices',
            render: (product) => (
                <div className="text-sm">
                    <p>{product.selling_price} ETB</p>
                    <p className="text-xs text-muted-foreground">Buy {product.buy_price} ETB</p>
                </div>
            ),
        },
        {
            key: 'stock',
            header: 'Stock',
            render: (product) => (
                <div className="text-sm">
                    <p>{product.inventory?.available_stock ?? 0} {product.unit ?? 'units'}</p>
                    <p className="text-xs text-muted-foreground">Reorder at {product.reorder_level}</p>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (product) => <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>{product.status}</Badge>,
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (product) => (
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => setEditingProduct(product)} aria-label={`Edit ${product.name}`}>
                        <Pencil className="size-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => setDeactivatingProduct(product)} aria-label={`Deactivate ${product.name}`}>
                        <Power className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <Boxes className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Products</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage catalog items, barcodes, pricing, and reorder settings.
                            </p>
                        </div>
                    </div>

                    {products && (
                        <Button type="button" onClick={() => setCreateOpen(true)}>
                            <Plus className="size-4" />
                            New product
                        </Button>
                    )}
                </div>

                {!products ? (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>Business profile required</AlertTitle>
                        <AlertDescription>
                            Set up your business profile before creating products.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
                            <SearchBox
                                defaultValue={filters.search ?? ''}
                                placeholder="Search products or barcodes..."
                                onSearch={(search) => updateFilters({ search: search || undefined })}
                            />
                            <select
                                value={filters.category_id ?? ''}
                                onChange={(event) => updateFilters({ category_id: event.target.value ? Number(event.target.value) : undefined })}
                                className="border-input bg-background flex h-10 rounded-md border px-3 text-sm shadow-xs"
                            >
                                <option value="">All categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                            <select
                                value={filters.status ?? ''}
                                onChange={(event) => updateFilters({ status: event.target.value || undefined })}
                                className="border-input bg-background flex h-10 rounded-md border px-3 text-sm shadow-xs"
                            >
                                <option value="">All statuses</option>
                                {statuses.map((status) => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {products.data.slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        <DataTable
                            columns={columns}
                            data={products.data}
                            rowKey={(product) => product.id}
                            emptyMessage="No products yet. Add the first product to start building your catalog."
                        />

                        <Pagination links={products.links} from={products.from} to={products.to} total={products.total} />
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New product</DialogTitle>
                    </DialogHeader>
                    <ProductForm categories={categories} product={null} onSuccess={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingProduct(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit product</DialogTitle>
                    </DialogHeader>
                    <ProductForm categories={categories} product={editingProduct} onSuccess={() => setEditingProduct(null)} />
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={Boolean(deactivatingProduct)}
                onOpenChange={(open) => !open && setDeactivatingProduct(null)}
                itemLabel={deactivatingProduct?.name ?? 'this product'}
                onConfirm={confirmDeactivate}
                processing={deactivating}
                description="The product will stay in historical records, but it will no longer be treated as an active catalog item."
            />
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/products' },
    ],
};
