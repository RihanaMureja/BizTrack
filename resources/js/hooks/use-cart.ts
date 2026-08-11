import { useCallback, useEffect, useRef, useState } from 'react';
import { cartStorageKey, clampQuantity } from '@/lib/cart';
import type { CartItem, CartProduct } from '@/lib/cart';

function readCart(key: string): CartItem[] {
    try {
        const value = localStorage.getItem(key);

        return value ? JSON.parse(value) : [];
    } catch {
        return [];
    }
}

export function useCart(businessId?: number | null) {
    const key = cartStorageKey(businessId);
    const [items, setItems] = useState<CartItem[]>(() => readCart(key));
    const keyRef = useRef(key);

    useEffect(() => {
        if (keyRef.current !== key) {
            keyRef.current = key;
            setItems(readCart(key));

            return;
        }

        localStorage.setItem(key, JSON.stringify(items));
    }, [key, items]);

    const add = useCallback((product: CartProduct) => {
        const stock = product.inventory?.available_stock ?? 0;

        if (stock < 1) {
            return;
        }

        setItems((current) => {
            const existing = current.find((item) => item.id === product.id);

            if (!existing) {
                return [...current, { ...product, quantity: 1 }];
            }

            return current.map((item) =>
                item.id === product.id
                    ? {
                          ...item,
                          quantity: clampQuantity(item.quantity + 1, stock),
                      }
                    : item,
            );
        });
    }, []);

    const setQuantity = useCallback((id: number, quantity: number) => {
        setItems((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          quantity: clampQuantity(
                              quantity,
                              item.inventory?.available_stock ?? 0,
                          ),
                      }
                    : item,
            ),
        );
    }, []);

    const remove = useCallback(
        (id: number) =>
            setItems((current) => current.filter((item) => item.id !== id)),
        [],
    );
    const clear = useCallback(() => setItems([]), []);

    return { items, add, setQuantity, remove, clear };
}
