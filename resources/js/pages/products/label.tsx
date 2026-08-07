import { PrintableLabel } from '@/components/products/printable-label';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

type Product = {
    id: number;
    name: string;
    barcode: string;
    qr_payload: string | null;
    selling_price: string;
    unit: string | null;
    business?: { business_name: string } | null;
};

export default function ProductLabel({ product }: { product: Product }) {
    return (
        <>
            <Head title={`${product.name} Label`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <Button variant="outline" asChild>
                        <Link href={`/products/${product.id}`}>
                            <ArrowLeft className="size-4" />
                            Back to product
                        </Link>
                    </Button>
                    <Button type="button" onClick={() => window.print()}>
                        <Printer className="size-4" />
                        Print label
                    </Button>
                </div>

                <PrintableLabel product={product} />
            </div>
        </>
    );
}

ProductLabel.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/products' },
        { title: 'Printable label', href: '#' },
    ],
};
