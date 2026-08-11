import { Link } from '@inertiajs/react';
import { ChartColumn, Package, Pencil, Power, ScanBarcode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ProductCardProduct = {
    id: number;
    name: string;
    barcode: string | null;
    buy_price: string;
    selling_price: string;
    reorder_level: number;
    status: string;
    category?: { name: string } | null;
    inventory?: { quantity?: number; available_stock?: number } | null;
};

type Props = {
    product: ProductCardProduct;
    onEdit: () => void;
    onDeactivate: () => void;
};

export function ProductCard({ product, onEdit, onDeactivate }: Props) {
    const stock = product.inventory?.available_stock ?? 0;
    const stockBadge =
        stock <= 0 ? (
            <Badge variant="destructive">Out of stock</Badge>
        ) : stock <= product.reorder_level ? (
            <Badge variant="secondary">Low stock</Badge>
        ) : (
            <Badge variant="default">Healthy</Badge>
        );

    return (
        <article
            className={cn(
                'group relative flex flex-col rounded-md border bg-card p-4 shadow-sm transition-all duration-300',
                'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
                'focus-within:border-primary/40',
            )}
        >
            <Link
                href={`/products/${product.id}/insights`}
                className="absolute inset-0 z-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label={`View ${product.name} details and insights`}
            >
                <span className="sr-only">View {product.name} details and insights</span>
            </Link>

            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Package className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {product.category?.name ?? 'Uncategorized'}
                        </p>
                    </div>
                </div>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status}
                </Badge>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Selling price</p>
                    <p className="mt-0.5 truncate text-lg font-semibold tracking-tight">
                        {Number(product.selling_price).toFixed(2)} ETB
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Buy {Number(product.buy_price).toFixed(2)} ETB
                    </p>
                </div>
                <div className="shrink-0 text-right">
                    {stockBadge}
                    <p className="mt-1 text-xs text-muted-foreground">
                        {stock} in stock · reorder at {product.reorder_level}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                <ScanBarcode className="size-4 shrink-0" />
                <span className="truncate">{product.barcode ?? 'No barcode'}</span>
            </div>

            <div className="relative z-10 mt-4 flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={onEdit}
                >
                    <Pencil className="size-3.5" />
                    Edit
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                    aria-label={`View ${product.name} insights`}
                >
                    <Link href={`/products/${product.id}/insights`}>
                        <ChartColumn className="size-4" />
                    </Link>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onDeactivate}
                    aria-label={`Deactivate ${product.name}`}
                >
                    <Power className="size-4" />
                </Button>
            </div>
        </article>
    );
}
