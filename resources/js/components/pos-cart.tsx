import type { CartItem } from '@/lib/cart';
import { cartSubtotal } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

export function PosCart({ items, onQuantity, onRemove, onClear, onCheckout }: {
    items: CartItem[];
    onQuantity: (id: number, quantity: number) => void;
    onRemove: (id: number) => void;
    onClear: () => void;
    onCheckout: () => void;
}) {
    const subtotal = cartSubtotal(items);
    return <aside className="flex min-h-[32rem] flex-col gap-4 rounded-md border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ShoppingCart className="size-5 text-primary" /><h2 className="font-semibold">Cart</h2></div>
            {items.length > 0 && <Button type="button" variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" />Clear</Button>}
        </div>
        <div className="flex-1 space-y-3">
            {items.length === 0 && <div className="rounded-md border border-dashed bg-background/60 p-5 text-center text-sm text-muted-foreground">Add products to start a sale.</div>}
            {items.map((item) => <div key={item.id} className="rounded-md border bg-background/70 p-3">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-medium">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{Number(item.selling_price).toFixed(2)} ETB each</p></div>
                    <Button type="button" size="icon" variant="ghost" onClick={() => onRemove(item.id)} title={`Remove ${item.name}`}><Trash2 className="size-4" /></Button></div>
                <div className="mt-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><Button type="button" size="icon" variant="outline" onClick={() => onQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="size-4" /></Button>
                    <input value={item.quantity} type="number" min="1" max={item.inventory?.available_stock ?? 0} onChange={(event) => onQuantity(item.id, Number(event.target.value))} className="border-input h-9 w-14 rounded-md border bg-background text-center text-sm" />
                    <Button type="button" size="icon" variant="outline" onClick={() => onQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= (item.inventory?.available_stock ?? 0)}><Plus className="size-4" /></Button></div><span className="font-semibold">{(Number(item.selling_price) * item.quantity).toFixed(2)} ETB</span></div>
            </div>)}
        </div>
        <div className="border-t pt-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)} ETB</span></div><Button type="button" className="mt-4 w-full" disabled={!items.length} onClick={onCheckout}>Proceed to payment</Button></div>
    </aside>;
}
