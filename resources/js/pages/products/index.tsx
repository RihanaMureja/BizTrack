import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { ProductCard } from '@/components/products/product-card';
import type { CatalogProduct } from '@/components/products/product-card';
import { ProductFiltersBar } from '@/components/products/product-filters-bar';
import { ProductFormModal } from '@/components/products/product-form-modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Boxes, Plus } from 'lucide-react';
import { useState } from 'react';

type Category = {
    id: number;
    name: string;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Filters = {
    search: string | null;
    category_id: number | null;
    status: string | null;
    sort: string | null;
};

type Props = {
    products: Paginated<CatalogProduct> | null;
    categories: Category[];
    filters: Filters;
    statuses: Array<{ value: string; label: string }>;
};

export default function ProductsIndex({ products, categories, filters, statuses }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
    const [deactivatingProduct, setDeactivatingProduct] = useState<CatalogProduct | null>(null);
    const [deactivating, setDeactivating] = useState(false);

    const updateFilters = (next: Partial<Filters>) => {
        const params = {
            search: filters.search ?? undefined,
            category_id: filters.category_id ?? undefined,
            status: filters.status ?? undefined,
            sort: filters.sort ?? undefined,
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
                                Manage catalog items, stock readiness, pricing, and sales movement from one card view.
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
                        <ProductFiltersBar categories={categories} filters={filters} statuses={statuses} onChange={updateFilters} />

                        {products.data.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onEdit={setEditingProduct}
                                        onDeactivate={setDeactivatingProduct}
                                    />
                                ))}
                            </div>
                        ) : (
                            <section className="rounded-md border bg-card p-8 text-center shadow-sm">
                                <h2 className="text-lg font-semibold">No products found</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Adjust the filters or create the first catalog item for this business.
                                </p>
                                <Button type="button" onClick={() => setCreateOpen(true)} className="mt-5">
                                    <Plus className="size-4" />
                                    New product
                                </Button>
                            </section>
                        )}

                        <Pagination links={products.links} from={products.from} to={products.to} total={products.total} />
                    </div>
                )}
            </div>

            <ProductFormModal open={createOpen} onOpenChange={setCreateOpen} categories={categories} product={null} />

            <ProductFormModal
                open={Boolean(editingProduct)}
                onOpenChange={(open) => !open && setEditingProduct(null)}
                categories={categories}
                product={editingProduct}
            />

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
