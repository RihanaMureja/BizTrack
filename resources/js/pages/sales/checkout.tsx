import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { cartSubtotal, type CartProduct } from '@/lib/cart';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

type Customer = {
    id: number;
    full_name: string;
    current_balance: string;
    credit_limit: string;
};
type Props = {
    products: CartProduct[];
    customers: Customer[];
    canOverrideDiscount: boolean;
};
const methods = [
    ['cash', 'Cash'],
    ['bank', 'Bank transfer'],
    ['telebirr', 'Telebirr'],
    ['chapa', 'Chapa'],
] as const;

export default function Checkout({
    products,
    customers,
    canOverrideDiscount,
}: Props) {
    const cart = useCart();
    const items = useMemo(
        () =>
            cart.items.flatMap((item) => {
                const current = products.find(
                    (product) => product.id === item.id,
                );
                return current && (current.inventory?.available_stock ?? 0) > 0
                    ? [
                          {
                              ...current,
                              quantity: Math.min(
                                  item.quantity,
                                  current.inventory?.available_stock ?? 0,
                              ),
                          },
                      ]
                    : [];
            }),
        [cart.items, products],
    );
    const form = useForm({
        customer_id: '',
        tax_amount: '0',
        notes: '',
        payment_method: 'cash',
        amount_received: '',
        enable_credit: false,
        discount_type: '',
        discount_value: '',
        payment_reference: '',
        payment_notes: '',
    });
    const subtotal = cartSubtotal(items);
    const tax = Math.max(0, Number(form.data.tax_amount) || 0);
    const manualDiscount =
        form.data.discount_type === 'manual'
            ? Math.min(
                  subtotal + tax,
                  Math.max(0, Number(form.data.discount_value) || 0),
              )
            : 0;
    const total = Math.max(0, subtotal + tax - manualDiscount);
    const received = Math.max(0, Number(form.data.amount_received) || 0);
    const balance = Math.max(0, total - received);
    const change =
        form.data.payment_method === 'cash' ? Math.max(0, received - total) : 0;
    const selectedCustomer = customers.find(
        (customer) => customer.id === Number(form.data.customer_id),
    );
    const availableCredit = selectedCustomer
        ? Math.max(
              0,
              Number(selectedCustomer.credit_limit) -
                  Number(selectedCustomer.current_balance),
          )
        : null;
    const canSubmit =
        items.length > 0 &&
        received > 0 &&
        (balance === 0 ||
            (form.data.enable_credit && Boolean(form.data.customer_id)));

    const submit = () => {
        form.transform((data) => ({
            ...data,
            customer_id: data.customer_id || null,
            items: items.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
            })),
        }));
        form.post('/sales/checkout', {
            preserveScroll: true,
            onSuccess: () => cart.clear(),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sales', href: '/sales' },
                { title: 'POS', href: '/sales/pos' },
                { title: 'Checkout', href: '/sales/checkout' },
            ]}
        >
            <Head title="Checkout" />
            <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Checkout</h1>
                        <p className="text-sm text-muted-foreground">
                            Review the cart and record payment.
                        </p>
                    </div>
                    <Link
                        href="/sales/pos"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        Back to POS
                    </Link>
                </div>
                {items.length === 0 ? (
                    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Your cart is empty. Return to the POS to add products.
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                        <section className="space-y-4 rounded-md border bg-card p-4">
                            <h2 className="font-semibold">Cart review</h2>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between border-b pb-3 text-sm"
                                >
                                    <span>
                                        {item.name}{' '}
                                        <span className="text-muted-foreground">
                                            x{item.quantity}
                                        </span>
                                    </span>
                                    <span className="font-medium">
                                        {(
                                            Number(item.selling_price) *
                                            item.quantity
                                        ).toFixed(2)}{' '}
                                        ETB
                                    </span>
                                </div>
                            ))}
                            <label className="grid gap-2 text-sm font-medium">
                                Customer
                                <select
                                    value={form.data.customer_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'customer_id',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-md border border-input bg-background px-3"
                                >
                                    <option value="">Walk-in customer</option>
                                    {customers.map((customer) => (
                                        <option
                                            key={customer.id}
                                            value={customer.id}
                                        >
                                            {customer.full_name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-2 text-sm font-medium">
                                Tax
                                <input
                                    value={form.data.tax_amount}
                                    onChange={(event) =>
                                        form.setData(
                                            'tax_amount',
                                            event.target.value,
                                        )
                                    }
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="h-10 rounded-md border border-input bg-background px-3"
                                />
                            </label>
                            {canOverrideDiscount && (
                                <>
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <input
                                            type="checkbox"
                                            checked={
                                                form.data.discount_type ===
                                                'manual'
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'discount_type',
                                                    event.target.checked
                                                        ? 'manual'
                                                        : '',
                                                )
                                            }
                                        />
                                        Override discount
                                    </label>
                                    {form.data.discount_type === 'manual' && (
                                        <label className="grid gap-2 text-sm font-medium">
                                            Discount amount
                                            <input
                                                value={form.data.discount_value}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'discount_value',
                                                        event.target.value,
                                                    )
                                                }
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="h-10 rounded-md border border-input bg-background px-3"
                                            />
                                        </label>
                                    )}
                                </>
                            )}
                            <label className="grid gap-2 text-sm font-medium">
                                Sale notes
                                <textarea
                                    value={form.data.notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    className="min-h-20 rounded-md border border-input bg-background p-3"
                                />
                            </label>
                        </section>
                        <aside className="space-y-4 rounded-md border bg-card p-4">
                            <h2 className="font-semibold">Payment</h2>
                            <label className="grid gap-2 text-sm font-medium">
                                Method
                                <select
                                    value={form.data.payment_method}
                                    onChange={(event) =>
                                        form.setData(
                                            'payment_method',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-md border border-input bg-background px-3"
                                >
                                    {methods.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-2 text-sm font-medium">
                                Amount tendered
                                <input
                                    value={form.data.amount_received}
                                    onChange={(event) =>
                                        form.setData(
                                            'amount_received',
                                            event.target.value,
                                        )
                                    }
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    className="h-10 rounded-md border border-input bg-background px-3"
                                />
                                {form.errors.amount_received && (
                                    <span className="text-xs text-destructive">
                                        {form.errors.amount_received}
                                    </span>
                                )}
                            </label>
                            {form.data.payment_method !== 'cash' && (
                                <label className="grid gap-2 text-sm font-medium">
                                    Reference
                                    <input
                                        value={form.data.payment_reference}
                                        onChange={(event) =>
                                            form.setData(
                                                'payment_reference',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 rounded-md border border-input bg-background px-3"
                                    />
                                </label>
                            )}
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={form.data.enable_credit}
                                    onChange={(event) =>
                                        form.setData(
                                            'enable_credit',
                                            event.target.checked,
                                        )
                                    }
                                    disabled={!form.data.customer_id}
                                />
                                Enable customer credit
                            </label>
                            {selectedCustomer && (
                                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                                    <div className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Available credit
                                        </span>
                                        <span className="font-semibold">
                                            {availableCredit?.toFixed(2)} ETB
                                        </span>
                                    </div>
                                </div>
                            )}
                            <label className="grid gap-2 text-sm font-medium">
                                Payment notes
                                <textarea
                                    value={form.data.payment_notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'payment_notes',
                                            event.target.value,
                                        )
                                    }
                                    className="min-h-20 rounded-md border border-input bg-background p-3"
                                />
                            </label>
                            <div className="space-y-2 border-t pt-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{subtotal.toFixed(2)} ETB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>{tax.toFixed(2)} ETB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Discount</span>
                                    <span>
                                        -{manualDiscount.toFixed(2)} ETB
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-semibold">
                                    <span>Total</span>
                                    <span>{total.toFixed(2)} ETB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Balance</span>
                                    <span>{balance.toFixed(2)} ETB</span>
                                </div>
                                {form.data.payment_method === 'cash' && (
                                    <div className="flex justify-between">
                                        <span>Change due</span>
                                        <span>{change.toFixed(2)} ETB</span>
                                    </div>
                                )}
                            </div>
                            <Button
                                type="button"
                                onClick={submit}
                                disabled={!canSubmit || form.processing}
                                className="w-full"
                            >
                                {form.processing
                                    ? 'Completing sale...'
                                    : 'Complete sale'}
                            </Button>
                        </aside>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
