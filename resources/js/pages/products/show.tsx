import { ProductCardSparkline } from '@/components/products/product-card-sparkline';
import { ProductCodePreview } from '@/components/products/product-code-preview';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Lightbulb, Package, Percent, Printer, XCircle } from 'lucide-react';
import type { FormEvent } from 'react';

type Insight = {
    id: number;
    type: string;
    status: string;
    days_without_sale: number;
    threshold_days: number;
    stock_on_hand: number;
    last_sold_at: string | null;
    detected_at: string | null;
    suggested_action: string | null;
    discount_price: string | null;
    discount_percent: string | null;
    allow_below_cost: boolean;
    discount_reason: string | null;
    discount_applied_at: string | null;
};

type Product = {
    id: number;
    name: string;
    barcode: string | null;
    qr_payload: string | null;
    description: string | null;
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
    unit: string | null;
    reorder_level: number;
    status: string;
    category: { id: number; name: string } | null;
    inventory: { quantity: number; available_stock: number } | null;
    sales_trend?: Array<{ date: string; units: number }>;
    movement_insights?: Insight[];
};

type Props = {
    product: Product;
    preferences: {
        enabled: boolean;
        threshold_days: number;
        minimum_stock: number;
        frequency_days: number;
    };
};

const statusVariant = (status: string) => status === 'open' ? 'outline' : status === 'resolved' ? 'default' : 'secondary';

export default function ProductShow({ product, preferences }: Props) {
    const stock = product.inventory?.available_stock ?? 0;
    const totalSold = (product.sales_trend ?? []).reduce((sum, point) => sum + point.units, 0);
    const insights = product.movement_insights ?? [];
    const sellingPrice = Number(product.current_selling_price ?? 0);
    const effectiveSellingPrice = Number(product.effective_selling_price ?? sellingPrice);
    const unitCost = Number(product.current_unit_cost ?? 0);
    const discountForm = useForm({
        discount_price: '',
        allow_below_cost: false,
        discount_reason: '',
    });

    const applyDiscount = (event: FormEvent, insightId: number) => {
        event.preventDefault();
        discountForm.post(`/product-insights/${insightId}/discount`, {
            preserveScroll: true,
            onSuccess: () => discountForm.reset(),
        });
    };

    return (
        <>
            <Head title={product.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <Package className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">{product.name}</h1>
                            <p className="text-sm text-muted-foreground">{product.category?.name ?? 'Uncategorized'} - {product.barcode ?? 'No barcode'}</p>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/products">
                            <ArrowLeft className="size-4" />
                            Back to products
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/products/${product.id}/label`}>
                            <Printer className="size-4" />
                            Printable label
                        </Link>
                    </Button>
                </div>

                <section className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">{product.is_discounted ? 'Active sale price' : 'Current selling price'}</p>
                        <p className="mt-2 text-2xl font-semibold">{effectiveSellingPrice > 0 ? `${effectiveSellingPrice.toLocaleString()} ETB` : 'Restock first'}</p>
                        {product.is_discounted && (
                            <p className="mt-1 text-xs text-muted-foreground line-through">{sellingPrice.toLocaleString()} ETB regular</p>
                        )}
                    </div>
                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">Current unit cost</p>
                        <p className="mt-2 text-2xl font-semibold">{unitCost > 0 ? `${unitCost.toLocaleString()} ETB` : 'No batch yet'}</p>
                    </div>
                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">Available stock</p>
                        <p className="mt-2 text-2xl font-semibold">{stock} {product.unit ?? 'units'}</p>
                    </div>
                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">30-day units sold</p>
                        <p className="mt-2 text-2xl font-semibold">{totalSold}</p>
                    </div>
                </section>

                <section className="rounded-md border bg-card p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">Sales trend</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Units sold over the last 30 days.</p>
                        </div>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>{product.status}</Badge>
                    </div>
                    <div className="mt-6 text-primary">
                        <ProductCardSparkline data={product.sales_trend ?? []} />
                    </div>
                </section>

                {product.barcode && (
                    <section className="rounded-md border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">Generated product code</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Barcode and QR payload are generated by BizTrack and stay stable after sales reference this product.
                        </p>
                        <div className="mt-5">
                            <ProductCodePreview barcode={product.barcode} qrPayload={product.qr_payload} />
                        </div>
                    </section>
                )}

                <section className="rounded-md border bg-card p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
                            <Lightbulb className="size-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Product insights</h2>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Stagnant product detection is {preferences.enabled ? 'enabled' : 'disabled'} with a {preferences.threshold_days}-day threshold
                                and minimum stock of {preferences.minimum_stock}.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                        {insights.length > 0 ? insights.map((insight) => (
                            <div key={insight.id} className="rounded-md border bg-background p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusVariant(insight.status)}>{insight.status}</Badge>
                                            <p className="text-sm font-medium">{insight.days_without_sale} days without sale</p>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {insight.suggested_action ?? 'Review pricing, placement, or promotion for this product.'}
                                        </p>
                                    </div>
                                    {insight.status === 'open' && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => router.post(`/product-insights/${insight.id}/dismiss`, {}, { preserveScroll: true })}>
                                                <XCircle className="size-4" />
                                                Dismiss
                                            </Button>
                                            <Button size="sm" onClick={() => router.post(`/product-insights/${insight.id}/resolve`, {}, { preserveScroll: true })}>
                                                <CheckCircle2 className="size-4" />
                                                Resolve
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {insight.status === 'open' && (
                                    <div className="mt-4 rounded-md border bg-card p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                <Percent className="size-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">Controlled stagnant discount</h3>
                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                    Use this when stock is sitting too long. By default, BizTrack blocks discounts below the latest batch unit cost.
                                                </p>
                                            </div>
                                        </div>
                                        {insight.discount_applied_at && (
                                            <div className="mt-3 rounded-md bg-primary/5 p-3 text-sm">
                                                Active discount: <strong>{Number(insight.discount_price ?? 0).toLocaleString()} ETB</strong>
                                                {insight.discount_percent ? ` (${Number(insight.discount_percent).toFixed(2)}% off)` : ''}
                                                {insight.allow_below_cost ? ' - below-cost override recorded' : ''}
                                            </div>
                                        )}
                                        <form onSubmit={(event) => applyDiscount(event, insight.id)} className="mt-4 grid gap-3">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor={`discount_price_${insight.id}`}>Discount price</Label>
                                                    <Input
                                                        id={`discount_price_${insight.id}`}
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={discountForm.data.discount_price}
                                                        onChange={(event) => discountForm.setData('discount_price', event.target.value)}
                                                        placeholder={`Minimum safe ${unitCost.toFixed(2)} ETB`}
                                                    />
                                                    <InputError message={discountForm.errors.discount_price} />
                                                </div>
                                                <label className="flex items-center gap-2 self-end rounded-md border bg-background px-3 py-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={discountForm.data.allow_below_cost}
                                                        onChange={(event) => discountForm.setData('allow_below_cost', event.target.checked)}
                                                    />
                                                    Allow below-cost override
                                                </label>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor={`discount_reason_${insight.id}`}>Reason</Label>
                                                <textarea
                                                    id={`discount_reason_${insight.id}`}
                                                    rows={3}
                                                    value={discountForm.data.discount_reason}
                                                    onChange={(event) => discountForm.setData('discount_reason', event.target.value)}
                                                    placeholder="Required if selling below cost. Example: expiry clearance, damaged stock, liquidation."
                                                    className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                />
                                                <InputError message={discountForm.errors.discount_reason} />
                                            </div>
                                            <Button type="submit" className="w-fit" disabled={discountForm.processing}>
                                                <Percent className="size-4" />
                                                Apply discount
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="rounded-md border border-dashed bg-background p-6 text-sm text-muted-foreground">
                                No movement insights are currently attached to this product.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

ProductShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/products' },
        { title: 'Product detail', href: '#' },
    ],
};
