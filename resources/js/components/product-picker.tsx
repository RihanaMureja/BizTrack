import { ScanBarcode } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CartProduct } from '@/lib/cart';

export function ProductPicker({ products, onAdd }: { products: CartProduct[]; onAdd: (product: CartProduct) => void }) {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => products.filter((product) => `${product.name} ${product.barcode ?? ''}`
        .toLowerCase().includes(query.toLowerCase())).slice(0, 24), [products, query]);

    return <section className="space-y-4">
        <label className="relative block">
            <ScanBarcode className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product or barcode"
                className="border-input bg-background h-10 w-full rounded-md border py-2 pl-10 pr-3 text-sm" autoFocus />
        </label>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => {
                const stock = product.inventory?.available_stock ?? 0;

                return <button key={product.id} type="button" onClick={() => onAdd(product)} disabled={stock < 1}
                    className="rounded-md border bg-card p-4 text-left shadow-sm transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">
                    <p className="font-medium">{product.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{product.barcode ?? 'No barcode'}</p>
                    <p className="mt-3 font-semibold">{Number(product.selling_price).toFixed(2)} ETB</p>
                    <p className="text-xs text-muted-foreground">Stock {stock} units</p>
                </button>;
            })}
        </div>
    </section>;
}
