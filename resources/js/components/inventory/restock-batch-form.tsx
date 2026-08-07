import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';
import type { FormEvent } from 'react';

type InventoryItem = {
    id: number;
    available_stock: number;
    product: {
        name: string;
        unit: string | null;
    };
};

export function RestockBatchForm({ item, onSuccess }: { item: InventoryItem; onSuccess: () => void }) {
    const form = useForm({
        quantity: '1',
        unit_cost: '',
        received_at: new Date().toISOString().slice(0, 10),
        expiry_date: '',
        notes: '',
    });

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
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="restock_quantity">Quantity received</Label>
                    <Input id="restock_quantity" type="number" min="1" value={form.data.quantity} onChange={(event) => form.setData('quantity', event.target.value)} required />
                    <InputError message={form.errors.quantity} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="restock_unit_cost">Unit cost</Label>
                    <Input id="restock_unit_cost" type="number" min="0" step="0.01" value={form.data.unit_cost} onChange={(event) => form.setData('unit_cost', event.target.value)} required />
                    <InputError message={form.errors.unit_cost} />
                </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="restock_received_at">Received date</Label>
                    <Input id="restock_received_at" type="date" value={form.data.received_at} onChange={(event) => form.setData('received_at', event.target.value)} />
                    <InputError message={form.errors.received_at} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="restock_expiry_date">Expiry date</Label>
                    <Input id="restock_expiry_date" type="date" value={form.data.expiry_date} onChange={(event) => form.setData('expiry_date', event.target.value)} />
                    <InputError message={form.errors.expiry_date} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="restock_notes">Notes</Label>
                <Input id="restock_notes" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} placeholder="Supplier, delivery note, or reason" />
                <InputError message={form.errors.notes} />
            </div>
            <Button type="submit" className="w-fit" disabled={form.processing}>
                {form.processing ? <Spinner /> : <PackagePlus className="size-4" />}
                Create batch
            </Button>
        </form>
    );
}
