import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export type ProductFormCategory = {
    id: number;
    name: string;
};

export type ProductFormProduct = {
    id?: number;
    category_id?: number | null;
    name?: string;
    barcode?: string | null;
    description?: string | null;
    buy_price?: string | number;
    selling_price?: string | number;
    unit?: string | null;
    reorder_level?: number;
    expire_date?: string | null;
    status?: string;
};

type Props = {
    categories: ProductFormCategory[];
    product: ProductFormProduct | null;
    onSuccess?: () => void;
};

export function ProductForm({ categories, product, onSuccess }: Props) {
    const isEditing = Boolean(product?.id);

    const form = useForm({
        category_id: product?.category_id ? String(product.category_id) : '',
        name: product?.name ?? '',
        barcode: product?.barcode ?? '',
        description: product?.description ?? '',
        buy_price: String(product?.buy_price ?? ''),
        selling_price: String(product?.selling_price ?? ''),
        unit: product?.unit ?? '',
        reorder_level: String(product?.reorder_level ?? 0),
        expire_date: product?.expire_date ?? '',
        status: product?.status ?? 'active',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onSuccess?.();
            },
        };

        form.transform((data) => ({
            ...data,
            category_id: data.category_id || null,
        }));

        if (isEditing && product?.id) {
            form.put(`/products/${product.id}`, options);
        } else {
            form.post('/products', options);
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="name">Product name</Label>
                    <Input
                        id="name"
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        required
                        autoFocus
                    />
                    <InputError message={form.errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category_id">Category</Label>
                    <select
                        id="category_id"
                        value={form.data.category_id}
                        onChange={(event) =>
                            form.setData('category_id', event.target.value)
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs ring-offset-background transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">Uncategorized</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <InputError message={form.errors.category_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                        id="barcode"
                        value={form.data.barcode}
                        onChange={(event) =>
                            form.setData('barcode', event.target.value)
                        }
                        placeholder="Optional"
                    />
                    <InputError message={form.errors.barcode} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="buy_price">Buy price</Label>
                    <Input
                        id="buy_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.data.buy_price}
                        onChange={(event) =>
                            form.setData('buy_price', event.target.value)
                        }
                        required
                    />
                    <InputError message={form.errors.buy_price} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="selling_price">Selling price</Label>
                    <Input
                        id="selling_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.data.selling_price}
                        onChange={(event) =>
                            form.setData('selling_price', event.target.value)
                        }
                        required
                    />
                    <InputError message={form.errors.selling_price} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                        id="unit"
                        value={form.data.unit}
                        onChange={(event) =>
                            form.setData('unit', event.target.value)
                        }
                        placeholder="pcs, box, kg"
                    />
                    <InputError message={form.errors.unit} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="reorder_level">Reorder level</Label>
                    <Input
                        id="reorder_level"
                        type="number"
                        min="0"
                        value={form.data.reorder_level}
                        onChange={(event) =>
                            form.setData('reorder_level', event.target.value)
                        }
                        required
                    />
                    <InputError message={form.errors.reorder_level} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="expire_date">Expiry date</Label>
                    <Input
                        id="expire_date"
                        type="date"
                        value={form.data.expire_date}
                        onChange={(event) =>
                            form.setData('expire_date', event.target.value)
                        }
                    />
                    <InputError message={form.errors.expire_date} />
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                        id="status"
                        value={form.data.status}
                        onChange={(event) =>
                            form.setData('status', event.target.value)
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs ring-offset-background transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <InputError message={form.errors.status} />
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        placeholder="Optional"
                    />
                    <InputError message={form.errors.description} />
                </div>
            </div>

            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <Save className="size-4" />}
                {isEditing ? 'Save changes' : 'Create product'}
            </Button>
        </form>
    );
}
