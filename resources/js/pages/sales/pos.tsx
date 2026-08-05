import { PosCart } from '@/components/pos-cart';
import { ProductPicker } from '@/components/product-picker';
import { useCart } from '@/hooks/use-cart';
import type { CartProduct } from '@/lib/cart';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

type Props = { products: CartProduct[] };

export default function Pos({ products }: Props) {
    const cart = useCart();
    return <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales' }, { title: 'Point of sale', href: '/sales/pos' }]}>
        <Head title="Point of Sale" />
        <div className="space-y-6 p-4 md:p-6"><div><h1 className="text-2xl font-semibold">Point of Sale</h1><p className="text-sm text-muted-foreground">Build the cart, then complete payment in checkout.</p></div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]"><ProductPicker products={products} onAdd={cart.add} /><PosCart items={cart.items} onQuantity={cart.setQuantity} onRemove={cart.remove} onClear={cart.clear} onCheckout={() => router.visit('/sales/checkout')} /></div>
        </div>
    </AppLayout>;
}
