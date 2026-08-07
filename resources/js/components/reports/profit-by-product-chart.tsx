import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type ProductProfitPoint = {
    product: string;
    revenue: number;
    cost: number;
    profit: number;
};

export function ProfitByProductChart({ data }: { data: ProductProfitPoint[] }) {
    return (
        <section className="rounded-md border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Profit by product</h2>
            <p className="mt-1 text-sm text-muted-foreground">Revenue, real batch cost, and margin contribution.</p>
            <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="product" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} ETB`} />
                        <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cost" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
