import { Badge } from '@/components/ui/badge';
import { Barcode, Package } from 'lucide-react';

type Props = {
    product: {
        name: string;
        barcode: string | null;
        selling_price: string;
        unit: string | null;
        status: string;
        category?: { name: string } | null;
        inventory?: { available_stock: number } | null;
    };
};

export function ProductCard({ product }: Props) {
    return (
        <div className="rounded-md border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Package className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {product.category?.name ?? 'Uncategorized'}
                        </p>
                    </div>
                </div>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status}
                </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-semibold">{product.selling_price} ETB</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Stock</p>
                    <p className="font-semibold">
                        {product.inventory?.available_stock ?? 0} {product.unit ?? 'units'}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Barcode className="size-4" />
                <span>{product.barcode || 'No barcode'}</span>
            </div>
        </div>
    );
}
