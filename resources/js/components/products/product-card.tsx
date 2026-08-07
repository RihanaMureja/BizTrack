import { ProductCardSparkline } from '@/components/products/product-card-sparkline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Barcode, Lightbulb, Package, Power } from 'lucide-react';
import type { MouseEvent } from 'react';

export type CatalogProduct = {
    id: number;
    category_id: number | null;
    name: string;
    barcode: string | null;
    qr_payload?: string | null;
    description: string | null;
    buy_price: string;
    selling_price: string;
    unit: string | null;
    reorder_level: number;
    status: string;
    category: { id: number; name: string } | null;
    inventory: { quantity: number; available_stock: number } | null;
    sales_trend?: Array<{ date: string; units: number }>;
    open_insight?: {
        id: number;
        days_without_sale: number;
        stock_on_hand: number;
        suggested_action: string | null;
    } | null;
};

type Props = {
    product: CatalogProduct;
    onEdit: (product: CatalogProduct) => void;
    onDeactivate: (product: CatalogProduct) => void;
};

export function ProductCard({ product, onEdit, onDeactivate }: Props) {
    const stock = product.inventory?.available_stock ?? 0;
    const lowStock = stock <= product.reorder_level;

    const stop = (event: MouseEvent) => {
        event.stopPropagation();
    };

    return (
        <article
            role="button"
            tabIndex={0}
            onClick={() => onEdit(product)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onEdit(product);
                }
            }}
            className="group flex min-h-[20rem] cursor-pointer flex-col rounded-md border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Package className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{product.category?.name ?? 'Uncategorized'}</p>
                    </div>
                </div>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>{product.status}</Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Selling price</p>
                    <p className="mt-1 font-semibold">{Number(product.selling_price).toLocaleString()} ETB</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Available stock</p>
                    <p className={lowStock ? 'mt-1 font-semibold text-amber-600' : 'mt-1 font-semibold'}>
                        {stock} {product.unit ?? 'units'}
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>30-day sales</span>
                    <span>{(product.sales_trend ?? []).reduce((sum, point) => sum + point.units, 0)} units</span>
                </div>
                <ProductCardSparkline data={product.sales_trend ?? []} />
            </div>

            {product.open_insight && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                    <div className="flex items-center gap-2 font-medium">
                        <Lightbulb className="size-4" />
                        No sales for {product.open_insight.days_without_sale} days
                    </div>
                    <p className="mt-1 line-clamp-2">{product.open_insight.suggested_action ?? 'Review pricing or promotion.'}</p>
                </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                    <Barcode className="size-4 shrink-0" />
                    <span className="truncate">{product.barcode || 'No barcode'}</span>
                </div>
                <div className="flex shrink-0 gap-2" onClick={stop}>
                    <Button type="button" variant="outline" size="sm" asChild>
                        <Link href={`/products/${product.id}`}>Details</Link>
                    </Button>
                    <Button type="button" variant="outline" size="sm" asChild>
                        <Link href={`/products/${product.id}/label`}>Label</Link>
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => onDeactivate(product)} aria-label={`Deactivate ${product.name}`}>
                        <Power className="size-4" />
                    </Button>
                </div>
            </div>
        </article>
    );
}
