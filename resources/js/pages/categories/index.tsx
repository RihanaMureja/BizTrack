import { CategoryForm } from '@/components/forms/category-form';
import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
import { Pagination } from '@/components/pagination/pagination';
import type { PaginationLink } from '@/components/pagination/pagination';
import { SearchBox } from '@/components/search-box/search-box';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (value: string) => {
        router.get(
            '/categories',
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
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

    const columns: DataTableColumn<Category>[] = [
        { key: 'name', header: 'Name' },
        {
            key: 'description',
            header: 'Description',
            render: (category) => (
                <span className="text-muted-foreground">{category.description || '—'}</span>
            ),
        },
        {
            key: 'products_count',
            header: 'Products',
            render: (category) => <Badge variant="secondary">{category.products_count}</Badge>,
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (category) => (
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingCategory(category)}
                        aria-label={`Edit ${category.name}`}
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setDeletingCategory(category)}
                        aria-label={`Delete ${category.name}`}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
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
                            <h1 className="text-xl font-semibold">Categories</h1>
                            <p className="text-sm text-muted-foreground">
                                Group your products so they're easy to browse and report on.
                            </p>
                        </div>
                    </div>

                    {categories && (
                        <Button type="button" onClick={() => setCreateOpen(true)}>
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
                            Set up your business profile before creating categories.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-col gap-4">
                        <SearchBox
                            defaultValue={filters.search ?? ''}
                            placeholder="Search categories..."
                            onSearch={handleSearch}
                        />

                        <DataTable
                            columns={columns}
                            data={categories.data}
                            rowKey={(category) => category.id}
                            emptyMessage="No categories yet. Create your first one to start organizing products."
                        />

                        <Pagination links={categories.links} from={categories.from} to={categories.to} total={categories.total} />
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm category={null} onSuccess={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(editingCategory)} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm category={editingCategory} onSuccess={() => setEditingCategory(null)} />
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
