export type CartProduct = {
    id: number;
    name: string;
    barcode: string | null;
    selling_price: string | number;
    inventory?: { available_stock: number } | null;
};

export type CartItem = CartProduct & { quantity: number };

export const cartStorageKey = 'biztrack.pos-cart';

export function cartSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + Number(item.selling_price) * item.quantity, 0);
}

export function clampQuantity(quantity: number, stock: number): number {
    return Math.max(1, Math.min(stock, Math.floor(quantity) || 1));
}
