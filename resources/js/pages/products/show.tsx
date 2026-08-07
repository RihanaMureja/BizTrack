import { ProductCardSparkline } from '@/components/products/product-card-sparkline';
import { ProductCodePreview } from '@/components/products/product-code-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Lightbulb, Package, Printer, XCircle } from 'lucide-react';

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
};

type Product = {
    id: number;
    name: string;
    barcode: string | null;
    qr_payload: string | null;
    description: string | null;
    buy_price: string;
    selling_price: string;
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
                        <p className="text-sm text-muted-foreground">Selling price</p>
                        <p className="mt-2 text-2xl font-semibold">{Number(product.selling_price).toLocaleString()} ETB</p>
                    </div>
                    <div className="rounded-md border bg-card p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">Buy price</p>
                        <p className="mt-2 text-2xl font-semibold">{Number(product.buy_price).toLocaleString()} ETB</p>
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
