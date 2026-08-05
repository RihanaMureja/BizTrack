import { cartStorageKey, clampQuantity, type CartItem, type CartProduct } from '@/lib/cart';
import { useCallback, useEffect, useState } from 'react';

function readCart(): CartItem[] {
    try {
        const value = localStorage.getItem(cartStorageKey);
        return value ? JSON.parse(value) : [];
    } catch {
        return [];
    }
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>(readCart);

    useEffect(() => {
        localStorage.setItem(cartStorageKey, JSON.stringify(items));
    }, [items]);

    const add = useCallback((product: CartProduct) => {
        const stock = product.inventory?.available_stock ?? 0;
        if (stock < 1) return;
        setItems((current) => {
            const existing = current.find((item) => item.id === product.id);
            if (!existing) return [...current, { ...product, quantity: 1 }];
            return current.map((item) => item.id === product.id
                ? { ...item, quantity: clampQuantity(item.quantity + 1, stock) }
                : item);
        });
    }, []);

    const setQuantity = useCallback((id: number, quantity: number) => {
        setItems((current) => current.map((item) => item.id === id
            ? { ...item, quantity: clampQuantity(quantity, item.inventory?.available_stock ?? 0) }
            : item));
    }, []);

    const remove = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);
    const clear = useCallback(() => setItems([]), []);

    return { items, add, setQuantity, remove, clear };
}
