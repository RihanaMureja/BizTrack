import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Boxes, PackageSearch, Plus } from 'lucide-react';
import { useState } from 'react';
import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
import { EmptyState } from '@/components/empty-state/empty-state';
import { ProductForm } from '@/components/forms/product-form';
import { PageHeader } from '@/components/page-header/page-header';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { ProductCard } from '@/components/product-card/product-card';
import type { ProductCardProduct } from '@/components/product-card/product-card';
import { SearchBox } from '@/components/search-box/search-box';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Category = {
    id: number;
    name: string;
};

type Product = ProductCardProduct & {
    category_id: number | null;
    description: string | null;
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

    const hasActiveFilters = Boolean(filters.search || filters.category_id || filters.status);

    return (
        <>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <PageHeader
                    title="Products"
                    description="Manage catalog items, barcodes, pricing, and reorder settings."
                    icon={Boxes}
                    actions={
                        products && (
                            <Button type="button" onClick={() => setCreateOpen(true)}>
                                <Plus className="size-4" />
                                Add product
                            </Button>
                        )
                    }
                />

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

                        {products.data.length === 0 ? (
                            hasActiveFilters ? (
                                <EmptyState
                                    icon={PackageSearch}
                                    title="No products match your filters"
                                    description="Try adjusting the search terms or filters to see more products."
                                    action={<Button type="button" variant="outline" onClick={() => updateFilters({ search: undefined, category_id: undefined, status: undefined })}>Clear filters</Button>}
                                />
                            ) : (
                                <EmptyState
                                    icon={PackageSearch}
                                    title="No products yet"
                                    description="Add the first product to start building your catalog. Products appear here as cards."
                                    action={<Button type="button" onClick={() => setCreateOpen(true)}><Plus className="size-4" />Add product</Button>}
                                />
                            )
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onEdit={() => setEditingProduct(product)}
                                        onDeactivate={() => setDeactivatingProduct(product)}
                                    />
                                ))}
                            </div>
                        )}

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
