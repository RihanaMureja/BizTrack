import { PaymentQrCode } from '@/components/payments/payment-qr-code';

export type PaymentReceipt = {
    business: {
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        logo_url: string | null;
        tin: string | null;
        is_vat_registered: boolean;
    };
    payment: {
        payment_number: string;
        receipt_number: string;
        method: string;
        status: string;
        amount: number;
        reference: string | null;
        gateway_reference: string | null;
        paid_at: string | null;
        verified_at: string | null;
        qr_payload: unknown;
    };
    sale: {
        invoice_number: string;
        subtotal: number;
        discount_amount: number;
        tax_amount: number;
        vat_enabled: boolean;
        vat_rate: number;
        grand_total: number;
        paid_amount: number;
        balance_due: number;
        sold_at: string | null;
    };
    customer: { name: string; phone: string | null; email: string | null };
    cashier: { name: string };
    items: Array<{ name: string; quantity: number; unit_price: number; line_total: number }>;
};

export function PaymentReceiptPreview({ receipt }: { receipt: PaymentReceipt }) {
    return (
        <article className="mx-auto max-w-2xl rounded-md bg-white p-6 text-slate-950 shadow-sm print:shadow-none">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex gap-3">
                    {receipt.business.logo_url && <img src={receipt.business.logo_url} alt="" className="size-12 rounded-md object-cover" />}
                    <div>
                        <h2 className="text-lg font-semibold">{receipt.business.name}</h2>
                        <p className="text-xs text-slate-500">{receipt.business.address ?? 'Business address not set'}</p>
                        <p className="text-xs text-slate-500">{receipt.business.phone ?? 'No phone'} | {receipt.business.email ?? 'No email'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase text-slate-500">Receipt</p>
                    <p className="font-mono text-sm font-semibold">{receipt.payment.receipt_number}</p>
                    <p className="mt-1 text-xs text-slate-500">{receipt.payment.status}</p>
                </div>
            </header>

            <section className="grid gap-3 border-b border-slate-200 py-4 text-sm sm:grid-cols-2">
                <Info label="Invoice" value={receipt.sale.invoice_number} />
                <Info label="Payment" value={receipt.payment.payment_number} />
                <Info label="Customer" value={receipt.customer.name} />
                <Info label="Cashier" value={receipt.cashier.name} />
                <Info label="Method" value={receipt.payment.method} />
                <Info label="Paid at" value={receipt.payment.paid_at ?? receipt.sale.sold_at ?? 'Pending'} />
                <Info label="Reference" value={receipt.payment.reference ?? receipt.payment.gateway_reference ?? 'None'} />
                <Info label="VAT" value={receipt.sale.vat_enabled ? `${receipt.sale.vat_rate}% VAT applied` : 'Not applied'} />
            </section>

            <section className="py-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="py-2">Item</th>
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 text-right">Price</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receipt.items.map((item) => (
                            <tr key={`${item.name}-${item.quantity}-${item.line_total}`} className="border-b border-slate-100">
                                <td className="py-2">{item.name}</td>
                                <td className="py-2 text-right">{item.quantity}</td>
                                <td className="py-2 text-right">{money(item.unit_price)}</td>
                                <td className="py-2 text-right">{money(item.line_total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="ml-auto grid max-w-xs gap-2 border-b border-slate-200 pb-4 text-sm">
                <Total label="Subtotal" value={receipt.sale.subtotal} />
                <Total label="Discount" value={-receipt.sale.discount_amount} />
                <Total label="VAT" value={receipt.sale.tax_amount} />
                <Total label="Grand total" value={receipt.sale.grand_total} strong />
                <Total label="Paid" value={receipt.payment.amount} />
                <Total label="Balance due" value={receipt.sale.balance_due} strong />
            </section>

            <footer className="pt-5 text-center">
                <PaymentQrCode payload={receipt.payment.qr_payload} />
                <p className="mt-3 text-xs text-slate-500">Scan to verify this BizTrack payment receipt.</p>
                <p className="mt-2 text-sm font-medium">Thank you for your business.</p>
            </footer>
        </article>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs uppercase text-slate-500">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}

function Total({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
    return (
        <div className={`flex justify-between gap-4 ${strong ? 'font-semibold' : ''}`}>
            <span>{label}</span>
            <span>{money(value)}</span>
        </div>
    );
}

function money(value: number) {
    return `${value.toFixed(2)} ETB`;
}
