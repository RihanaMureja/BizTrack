import { BadgeDollarSign, CheckCircle2, Clock3, ReceiptText } from 'lucide-react';

type Summary = {
    total_owed: number;
    total_paid: number;
    total_generated: number;
    unpaid_count: number;
};

const money = (value: number) => `${Number(value).toFixed(2)} ETB`;

export function ServiceFeeSummary({ summary }: { summary: Summary }) {
    const items = [
        { label: 'Total owed', value: money(summary.total_owed), icon: Clock3 },
        { label: 'Paid', value: money(summary.total_paid), icon: CheckCircle2 },
        { label: 'Generated', value: money(summary.total_generated), icon: BadgeDollarSign },
        { label: 'Unpaid records', value: String(summary.unpaid_count), icon: ReceiptText },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
                <div key={item.label} className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <item.icon className="size-4 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                </div>
            ))}
        </div>
    );
}
