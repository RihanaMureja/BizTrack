import { ProceedToPaymentModal } from '@/components/sales/proceed-to-payment-modal';
import { Button } from '@/components/ui/button';
import { Head, useForm } from '@inertiajs/react';
import { Minus, Plus, ScanBarcode, ShoppingCart, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type Product = { id: number; name: string; barcode: string | null; selling_price: string; unit: string | null; inventory: { available_stock: number } | null };
type Customer = {
    id: number;
    display_name: string;
    discount: { rule_name: string | null; discount_percent: number; qualifying_spend: number };
    credit: { suggested_limit: number; approved_limit: number; current_balance: number; available_credit: number };
};
type CartItem = Product & { quantity: number };
type Props = { products: Product[]; customers: Customer[]; business: { is_vat_registered: boolean; vat_rate: number } | null };

export default function Pos({ products, customers, business }: Props) {
    const [query, setQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const form = useForm({ customer_id: '', discount_amount: '0', apply_vat: business?.is_vat_registered ?? false, is_credit_sale: false, checkout_method: 'cash' as 'cash' | 'telebirr', checkout_phone: '', notes: '', items: [] as Array<{ product_id: number; quantity: number }> });
    const filtered = products.filter((product) => `${product.name} ${product.barcode ?? ''}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.selling_price) * item.quantity, 0), [cart]);
    const selectedCustomer = customers.find((customer) => String(customer.id) === String(form.data.customer_id));
    const automaticDiscount = selectedCustomer ? Number(((subtotal * selectedCustomer.discount.discount_percent) / 100).toFixed(2)) : 0;
    const effectiveDiscount = Math.max(Number(form.data.discount_amount || 0), automaticDiscount);
    const taxableAmount = Math.max(0, subtotal - effectiveDiscount);
    const vatAmount = business?.is_vat_registered && form.data.apply_vat ? Number((taxableAmount * ((business.vat_rate ?? 15) / 100)).toFixed(2)) : 0;
    const grandTotal = taxableAmount + vatAmount;
    const exceedsCredit = form.data.is_credit_sale && selectedCustomer ? grandTotal > selectedCustomer.credit.available_credit : false;

    const addProduct = (product: Product) => setCart((items) => {
        const existing = items.find((item) => item.id === product.id);
        if (existing) return items.map((item) => item.id === product.id ? { ...item, quantity: Math.min((product.inventory?.available_stock ?? 0), item.quantity + 1) } : item);
        return [...items, { ...product, quantity: 1 }];
    });
    const changeQty = (id: number, delta: number) => setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(item.inventory?.available_stock ?? 0, item.quantity + delta)) } : item));
    const removeItem = (id: number) => setCart((items) => items.filter((item) => item.id !== id));
    const clearCart = () => setCart([]);
    const submit = () => {
        form.transform((data) => ({ ...data, customer_id: data.customer_id || null, is_credit_sale: Boolean(data.is_credit_sale), apply_vat: Boolean(data.apply_vat), items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })) }));
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
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2"><ShoppingCart className="size-5 text-primary" /><h2 className="font-semibold">Cart</h2></div>
                        {cart.length > 0 && (
                            <Button type="button" variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="size-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                    <select value={form.data.customer_id} onChange={(event) => form.setData('customer_id', event.target.value)} className="border-input bg-background h-10 rounded-md border px-3 text-sm"><option value="">Walk-in customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}</select>
                    {selectedCustomer && (
                        <div className="rounded-md border bg-background/70 p-3 text-sm">
                            <label className="flex items-center gap-2 font-medium">
                                <input type="checkbox" checked={form.data.is_credit_sale} onChange={(event) => form.setData('is_credit_sale', event.target.checked)} />
                                Sell on credit
                            </label>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <span>Suggested: {selectedCustomer.credit.suggested_limit.toFixed(2)} ETB</span>
                                <span>Approved: {selectedCustomer.credit.approved_limit.toFixed(2)} ETB</span>
                                <span>Balance: {selectedCustomer.credit.current_balance.toFixed(2)} ETB</span>
                                <span>Available: {selectedCustomer.credit.available_credit.toFixed(2)} ETB</span>
                            </div>
                            {exceedsCredit && <p className="mt-2 text-sm text-destructive">This sale exceeds available credit.</p>}
                            {form.errors.is_credit_sale && <p className="mt-2 text-sm text-destructive">{form.errors.is_credit_sale}</p>}
                        </div>
                    )}
                    <div className="flex-1 space-y-3">
                        {cart.length === 0 && (
                            <div className="rounded-md border border-dashed bg-background/60 p-5 text-center text-sm text-muted-foreground">
                                Add products to start a sale.
                            </div>
                        )}
                        {cart.map((item) => (
                            <div key={item.id} className="rounded-md border bg-background/70 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{item.name}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{Number(item.selling_price).toFixed(2)} ETB each</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{(Number(item.selling_price) * item.quantity).toFixed(2)} ETB</p>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeItem(item.id)}
                                            className="mt-1 h-7 px-2 text-muted-foreground hover:text-destructive"
                                            aria-label={`Remove ${item.name} from cart`}
                                            title={`Remove ${item.name}`}
                                        >
                                            <Trash2 className="size-4" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <Button type="button" size="icon" variant="outline" onClick={() => changeQty(item.id, -1)} disabled={item.quantity <= 1}><Minus className="size-4" /></Button>
                                    <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                                    <Button type="button" size="icon" variant="outline" onClick={() => changeQty(item.id, 1)} disabled={item.quantity >= (item.inventory?.available_stock ?? 0)}><Plus className="size-4" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {business?.is_vat_registered && (
                        <label className="flex items-center gap-2 rounded-md border bg-background/70 p-3 text-sm">
                            <input type="checkbox" checked={form.data.apply_vat} onChange={(event) => form.setData('apply_vat', event.target.checked)} />
                            Apply VAT {business.vat_rate ?? 15}%
                        </label>
                    )}
                    <input value={form.data.discount_amount} onChange={(e) => form.setData('discount_amount', e.target.value)} type="number" min="0" step="0.01" placeholder="Discount" className="border-input bg-background h-10 rounded-md border px-3 text-sm" />
                    {selectedCustomer && selectedCustomer.discount.discount_percent > 0 && (
                        <div className="rounded-md border bg-primary/5 p-3 text-sm">
                            <p className="font-medium">Automatic discount: {selectedCustomer.discount.discount_percent}%</p>
                            <p className="text-muted-foreground">{selectedCustomer.discount.rule_name} applies from {selectedCustomer.discount.qualifying_spend.toFixed(2)} ETB recent spend.</p>
                        </div>
                    )}
                    {form.errors.items && <p className="text-sm text-destructive">{form.errors.items}</p>}
                    <div className="border-t pt-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)} ETB</span></div><div className="mt-2 flex justify-between"><span>Discount</span><span>{effectiveDiscount.toFixed(2)} ETB</span></div><div className="mt-2 flex justify-between"><span>VAT</span><span>{vatAmount.toFixed(2)} ETB</span></div><div className="mt-2 flex justify-between text-lg font-semibold"><span>Total</span><span>{grandTotal.toFixed(2)} ETB</span></div></div>
                    <Button onClick={() => setCheckoutOpen(true)} disabled={cart.length === 0 || form.processing || exceedsCredit}>Proceed to Payment</Button>
                </aside>
            </div>
            <ProceedToPaymentModal
                open={checkoutOpen}
                onOpenChange={setCheckoutOpen}
                method={form.data.checkout_method}
                phone={form.data.checkout_phone}
                processing={form.processing}
                total={grandTotal}
                phoneError={form.errors.checkout_phone}
                onMethodChange={(method) => form.setData('checkout_method', method)}
                onPhoneChange={(phone) => form.setData('checkout_phone', phone)}
                onConfirm={submit}
            />
        </>
    );
}

Pos.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Sales', href: '/sales' }, { title: 'POS', href: '/sales/pos' }] };
