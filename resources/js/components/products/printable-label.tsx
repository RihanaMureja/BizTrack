import { ProductCodePreview } from '@/components/products/product-code-preview';

type Product = {
    name: string;
    barcode: string;
    qr_payload: string | null;
    current_selling_price?: string | null;
    unit: string | null;
    business?: { business_name: string } | null;
};

export function PrintableLabel({ product }: { product: Product }) {
    const sellingPrice = Number(product.current_selling_price ?? 0);

    return (
        <section className="mx-auto max-w-xl rounded-md border bg-card p-6 shadow-sm print:border-none print:shadow-none">
            <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{product.business?.business_name ?? 'BizTrack'}</p>
                <h1 className="mt-2 text-2xl font-semibold">{product.name}</h1>
                <p className="mt-1 text-lg font-semibold text-primary">{sellingPrice > 0 ? `${sellingPrice.toLocaleString()} ETB` : 'Restock first'}</p>
                {product.unit && <p className="text-xs text-muted-foreground">Unit: {product.unit}</p>}
            </div>

            <div className="mt-6">
                <ProductCodePreview barcode={product.barcode} qrPayload={product.qr_payload} />
            </div>
        </section>
    );
}
