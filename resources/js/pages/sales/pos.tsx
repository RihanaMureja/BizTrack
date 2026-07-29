import { Head, useForm } from '@inertiajs/react';
import { Minus, Plus, ScanBarcode, ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type Product = { id: number; name: string; barcode: string | null; selling_price: string; unit: string | null; inventory: { available_stock: number } | null };
type Customer = { id: number; full_name: string };
type CartItem = Product & { quantity: number };
type Props = { products: Product[]; customers: Customer[] };

export default function Pos({ products, customers }: Props) {
    const [query, setQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const form = useForm({ customer_id: '', tax_amount: '0', discount_amount: '0', notes: '', items: [] as Array<{ product_id: number; quantity: number }> });
    const filtered = products.filter((product) => `${product.name} ${product.barcode ?? ''}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.selling_price) * item.quantity, 0), [cart]);
    const grandTotal = Math.max(0, subtotal + Number(form.data.tax_amount || 0) - Number(form.data.discount_amount || 0));

    const addProduct = (product: Product) => setCart((items) => {
        const existing = items.find((item) => item.id === product.id);

        if (existing) {
return items.map((item) => item.id === product.id ? { ...item, quantity: Math.min((product.inventory?.available_stock ?? 0), item.quantity + 1) } : item);
}

        return [...items, { ...product, quantity: 1 }];
    });
    const changeQty = (id: number, delta: number) => setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(item.inventory?.available_stock ?? 0, item.quantity + delta)) } : item).filter((item) => item.quantity > 0));
    const submit = () => {
        form.transform((data) => ({ ...data, customer_id: data.customer_id || null, items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })) }));
        form.post('/sales');
    };

    return (
        <>
            <Head title="POS" />
            <div className="grid h-full flex-1 gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:p-6">
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><ScanBarcode className="size-5" /></div><div><h1 className="text-xl font-semibold">Point of Sale</h1><p className="text-sm text-muted-foreground">Search by product name or barcode and add items to cart.</p></div></div>
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search or scan barcode..." className="border-input bg-background h-11 rounded-md border px-3 text-sm shadow-xs" />
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((product) => (
                            <button key={product.id} type="button" onClick={() => addProduct(product)} disabled={(product.inventory?.available_stock ?? 0) <= 0} className="rounded-md border bg-card p-4 text-left shadow-sm transition hover:bg-accent disabled:opacity-50">
                                <p className="font-medium">{product.name}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{product.barcode ?? 'No barcode'}</p>
                                <p className="mt-3 font-semibold">{product.selling_price} ETB</p>
                                <p className="text-xs text-muted-foreground">Stock {product.inventory?.available_stock ?? 0} {product.unit ?? 'units'}</p>
                            </button>
                        ))}
                    </div>
                </section>
                <aside className="flex flex-col gap-4 rounded-md border bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-2"><ShoppingCart className="size-5 text-primary" /><h2 className="font-semibold">Cart</h2></div>
                    <select value={form.data.customer_id} onChange={(event) => form.setData('customer_id', event.target.value)} className="border-input bg-background h-10 rounded-md border px-3 text-sm"><option value="">Walk-in customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select>
                    <div className="flex-1 space-y-3">
                        {cart.map((item) => <div key={item.id} className="rounded-md border p-3"><div className="flex justify-between gap-3"><p className="font-medium">{item.name}</p><p>{Number(item.selling_price) * item.quantity} ETB</p></div><div className="mt-2 flex items-center gap-2"><Button size="icon" variant="outline" onClick={() => changeQty(item.id, -1)}><Minus className="size-4" /></Button><span className="w-8 text-center">{item.quantity}</span><Button size="icon" variant="outline" onClick={() => changeQty(item.id, 1)}><Plus className="size-4" /></Button></div></div>)}
                    </div>
                    <input value={form.data.tax_amount} onChange={(e) => form.setData('tax_amount', e.target.value)} type="number" min="0" step="0.01" placeholder="Tax" className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                    <input value={form.data.discount_amount} onChange={(e) => form.setData('discount_amount', e.target.value)} type="number" min="0" step="0.01" placeholder="Discount" className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                    {form.errors.items && <p className="text-sm text-destructive">{form.errors.items}</p>}
                    <div className="border-t pt-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)} ETB</span></div><div className="mt-2 flex justify-between text-lg font-semibold"><span>Total</span><span>{grandTotal.toFixed(2)} ETB</span></div></div>
                    <Button onClick={submit} disabled={cart.length === 0 || form.processing}>{form.processing ? 'Completing...' : 'Complete sale'}</Button>
                </aside>
            </div>
        </>
    );
}

Pos.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Sales', href: '/sales' }, { title: 'POS', href: '/sales/pos' }] };
