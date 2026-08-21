import { CategoryForm } from '@/components/forms/category-form';
import { IconButton } from '@/components/buttons/icon-button';
import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
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
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Boxes, FolderSearch, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type Category = {
    id: number;
    name: string;
    description: string | null;
    products_count: number;
    created_at: string;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    categories: Paginated<Category> | null;
    filters: {
        search: string | null;
    };
};

export default function CategoriesIndex({ categories, filters }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (value: string) => {
        router.get('/categories', value ? { search: value } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const confirmDelete = () => {
        if (!deletingCategory) {
            return;
        }

        setDeleting(true);
        router.delete(`/categories/${deletingCategory.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeletingCategory(null);
            },
        });
    };

    const totalProducts =
        categories?.data.reduce(
            (sum, category) => sum + category.products_count,
            0,
        ) ?? 0;
    const largestCategory = Math.max(
        ...(categories?.data.map((category) => category.products_count) ?? [0]),
        1,
    );
    const categoryChart = (categories?.data ?? [])
        .filter((category) => category.products_count > 0)
        .slice(0, 6)
        .map((category) => ({
            name: category.name,
            value: category.products_count,
        }));
    const categoryColors = [
        'var(--primary)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
        'var(--accent)',
    ];

    return (
        <>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <Tags className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">
                                Categories
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Group your products so they're easy to browse
                                and report on.
                            </p>
                        </div>
                    </div>

                    {categories && (
                        <Button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus className="size-4" />
                            New category
                        </Button>
                    )}
                </div>

                {!categories ? (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>Business profile required</AlertTitle>
                        <AlertDescription>
                            Set up your business profile before creating
                            categories.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-col gap-4">
                        <SearchBox
                            defaultValue={filters.search ?? ''}
                            placeholder="Search categories..."
                            onSearch={handleSearch}
                        />

                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                            <section className="rounded-xl border bg-card p-5 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="font-semibold">
                                            Catalog groups
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Category cards show how the catalog
                                            is distributed before you open the
                                            records.
                                        </p>
                                    </div>
                                    <Badge variant="secondary">
                                        {categories.total} categories
                                    </Badge>
                                </div>

                                {categories.data.length === 0 ? (
                                    <div className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <FolderSearch className="size-6" />
                                        </div>
                                        <h3 className="mt-4 font-semibold">
                                            No categories found
                                        </h3>
                                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                            Adjust your search or create a
                                            category to organize products.
                                        </p>
                                        <Button
                                            type="button"
                                            className="mt-4"
                                            onClick={() => setCreateOpen(true)}
                                        >
                                            <Plus className="size-4" />
                                            New category
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                        {categories.data.map((category, index) => (
                                        <article
                                            key={category.id}
                                            className="group flex min-h-52 flex-col rounded-xl border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                        <Tags className="size-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="truncate font-semibold">
                                                            {category.name}
                                                        </h3>
                                                        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                                            {category.description ||
                                                                'No description'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">
                                                    {category.products_count}
                                                </Badge>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Product share</span>
                                                    <span>
                                                        {totalProducts > 0
                                                            ? Math.round(
                                                                  (category.products_count /
                                                                      totalProducts) *
                                                                      100,
                                                              )
                                                            : 0}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-2 rounded-full bg-muted">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: `${Math.max((category.products_count / largestCategory) * 100, category.products_count > 0 ? 8 : 0)}%`,
                                                            backgroundColor:
                                                                categoryColors[
                                                                    index %
                                                                        categoryColors.length
                                                                ],
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-auto flex justify-end gap-2 pt-4">
                                                <IconButton
                                                    variant="outline"
                                                    icon={Pencil}
                                                    label={`Edit ${category.name}`}
                                                    onClick={() =>
                                                        setEditingCategory(
                                                            category,
                                                        )
                                                    }
                                                />
                                                <IconButton
                                                    variant="outline"
                                                    icon={Trash2}
                                                    label={`Delete ${category.name}`}
                                                    onClick={() =>
                                                        setDeletingCategory(
                                                            category,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </article>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-xl border bg-card p-5 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Boxes className="size-5 text-primary" />
                                    <h2 className="font-semibold">
                                        Product mix
                                    </h2>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {totalProducts} products organized across
                                    visible categories.
                                </p>
                                {categoryChart.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height={220}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={categoryChart}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={52}
                                                outerRadius={82}
                                                paddingAngle={4}
                                            >
                                                {categoryChart.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={entry.name}
                                                            fill={
                                                                categoryColors[
                                                                    index %
                                                                        categoryColors.length
                                                                ]
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="mt-5 rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                                        Add products to see category
                                        distribution.
                                    </div>
                                )}
                            </section>
                        </div>

                        <Pagination
                            links={categories.links}
                            from={categories.from}
                            to={categories.to}
                            total={categories.total}
                        />
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        category={null}
                        onSuccess={() => setCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(editingCategory)}
                onOpenChange={(open) => !open && setEditingCategory(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        category={editingCategory}
                        onSuccess={() => setEditingCategory(null)}
                    />
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={Boolean(deletingCategory)}
                onOpenChange={(open) => !open && setDeletingCategory(null)}
                itemLabel={deletingCategory?.name ?? 'this category'}
                onConfirm={confirmDelete}
                processing={deleting}
                description={
                    deletingCategory && deletingCategory.products_count > 0
                        ? `${deletingCategory.name} has ${deletingCategory.products_count} product(s) assigned and cannot be deleted until they're moved or removed.`
                        : undefined
                }
            />
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categories', href: '/categories' },
    ],
};
