import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type SalesTrendPoint = {
    label: string;
    quantity: number;
    revenue: number;
};

export function SalesTrendChart({ data, title = 'Sales trend by product' }: { data: SalesTrendPoint[]; title?: string }) {
    return (
        <section className="rounded-md border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Daily quantity and revenue movement.</p>
            <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value) => Number(value).toFixed(2)} />
                        <Line type="monotone" dataKey="quantity" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
