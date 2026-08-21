import { ProductCardSparkline } from '@/components/products/product-card-sparkline';
import { visualForBusinessCategory } from '@/components/business/category-visuals';
import { IconButton } from '@/components/buttons/icon-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { Barcode, Lightbulb, Power, TrendingUp } from 'lucide-react';
import type { MouseEvent } from 'react';

export type CatalogProduct = {
    id: number;
    category_id: number | null;
    name: string;
    barcode: string | null;
    qr_payload?: string | null;
    description: string | null;
    buy_price?: string | null;
    selling_price?: string | null;
    unit: string | null;
    reorder_level: number;
    status: string;
    category: { id: number; name: string } | null;
    inventory: {
        quantity: number;
        available_stock: number;
        selling_price?: string | null;
    } | null;
    sales_trend?: Array<{ date: string; units: number }>;
    open_insight?: {
        id: number;
        days_without_sale: number;
        stock_on_hand: number;
        suggested_action: string | null;
    } | null;
    current_unit_cost?: string | null;
    current_selling_price?: string | null;
    effective_selling_price?: number | string | null;
    is_discounted?: boolean;
    active_discount?: {
        price: number | null;
        percent: number | null;
        reason: string | null;
        allow_below_cost: boolean;
        insight_id: number | null;
    };
};

type Props = {
    product: CatalogProduct;
    onEdit: (product: CatalogProduct) => void;
    onDeactivate: (product: CatalogProduct) => void;
};

export function ProductCard({ product, onEdit, onDeactivate }: Props) {
    const { auth } = usePage<{
        auth: { user?: { business_category?: string | null } | null };
    }>().props;
    const visual = visualForBusinessCategory(auth.user?.business_category);
    const Icon = visual.Icon;

    const regularSellingPrice = Number(product.current_selling_price ?? product.selling_price ?? 0);
    const sellingPrice = Number(product.effective_selling_price ?? regularSellingPrice);
    const unitCost = Number(product.current_unit_cost ?? product.buy_price ?? 0);
    const totalUnitsSold = (product.sales_trend ?? []).reduce(
        (sum, point) => sum + point.units,
        0,
    );
    const margin = sellingPrice - unitCost;
    const marginPercent = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;

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
            className="group flex min-h-[18rem] cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
            <div className="relative border-b bg-gradient-to-br from-primary/10 via-card to-card p-4">
                <div className="pointer-events-none absolute top-0 right-0 size-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                        <div
                            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-border ${visual.className}`}
                        >
                            <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold">
                                {product.name}
                            </h3>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                {product.category?.name ?? 'Uncategorized'}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant={
                            product.status === 'active'
                                ? 'default'
                                : 'secondary'
                        }
                    >
                        {product.status}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border bg-background p-3">
                        <p className="text-xs text-muted-foreground">
                            {product.is_discounted ? 'Active sale price' : 'Current selling price'}
                        </p>
                        <p className="mt-1 font-semibold">
                            {sellingPrice > 0 ? `${sellingPrice.toLocaleString()} ETB` : 'Restock first'}
                        </p>
                        {product.is_discounted && (
                            <p className="mt-1 text-xs text-muted-foreground line-through">
                                {regularSellingPrice.toLocaleString()} ETB
                            </p>
                        )}
                    </div>
                    <div className="rounded-xl border bg-background p-3">
                        <p className="text-xs text-muted-foreground">
                            Batch margin
                        </p>
                        <p
                            className={
                                margin >= 0
                                    ? 'mt-1 font-semibold text-primary'
                                    : 'mt-1 font-semibold text-destructive'
                            }
                        >
                            {marginPercent.toFixed(0)}%
                        </p>
                    </div>
                </div>

                <div className="mt-3 rounded-xl border bg-background p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-2 font-medium text-foreground">
                            <TrendingUp className="size-4 text-primary" />
                            30-day movement
                        </span>
                        <span>{totalUnitsSold} units</span>
                    </div>
                    <ProductCardSparkline data={product.sales_trend ?? []} />
                </div>

                {product.open_insight && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                        <div className="flex items-center gap-2 font-medium">
                            <Lightbulb className="size-4" />
                            No sales for{' '}
                            {product.open_insight.days_without_sale} days
                        </div>
                        {product.is_discounted && product.active_discount?.percent && (
                            <p className="mt-1 font-medium text-primary">
                                Discount active: {Number(product.active_discount.percent).toFixed(0)}% off
                            </p>
                        )}
                        <p className="mt-1 line-clamp-2">
                            {product.open_insight.suggested_action ??
                                'Review pricing or promotion.'}
                        </p>
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <div className="flex min-w-0 items-center gap-2 rounded-full bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground">
                        <Barcode className="size-4 shrink-0" />
                        <span className="truncate">
                            {product.barcode || 'No barcode'}
                        </span>
                    </div>
                    <div className="flex shrink-0 gap-2" onClick={stop}>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            asChild
                        >
                            <Link href={`/products/${product.id}`}>
                                Details
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            asChild
                        >
                            <Link href={`/products/${product.id}/label`}>
                                Label
                            </Link>
                        </Button>
                        <IconButton
                            variant="outline"
                            icon={Power}
                            label={`Deactivate ${product.name}`}
                            onClick={() => onDeactivate(product)}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}
