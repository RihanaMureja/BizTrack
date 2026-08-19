import { RevenueOverview } from '@/components/charts/revenue-overview';
import { StatCard } from '@/components/stat-card/stat-card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    CreditCard,
    Lightbulb,
    Package,
    Receipt,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    Users,
    WalletCards,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { LucideIcon } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type DashboardStat = {
    label: string;
    value: string;
    trend?: string;
    sparkline?: Array<{ label: string; value: number }>;
};

type DashboardData = {
    role: 'super_admin' | 'owner' | 'cashier';
    business?: {
        business_name: string;
        business_type?: string | null;
    } | null;
    stats: DashboardStat[];
    chart: Array<{ label: string; value: number }>;
    salesTrend?: Array<{ label: string; value: number }>;
    paymentBreakdown?: {
        cash: number;
        credit: number;
        vat: number;
        mobile: number;
    };
    inventoryHealth?: {
        low_stock: number;
        out_of_stock: number;
        expiring_batches: number;
        inventory_cost_value: string;
        inventory_selling_value: string;
    };
    customerInsights?: {
        total: number;
        new_this_month: number;
        pending_credit: string;
        credit_customers: number;
    };
    lowStock?: Array<{ name: string; stock: number; reorder: number }>;
    expiringBatches?: Array<{ name: string; batch: string; quantity: number; expiry_date: string }>;
    stagnantProducts?: Array<{ id: number; name: string; days_without_sale: number; stock_on_hand: number; suggested_action: string | null }>;
    topProducts?: Array<{ name: string; quantity: number; revenue: string; raw_revenue: number }>;
    recentActivity?: Array<{ type: string; title: string; description: string; time: string }>;
    smartRecommendations?: string[];
    nextSteps?: string[];
    queue?: string[];
    recentBusinesses?: Array<{
        id: number;
        business_name: string;
        business_type?: string | null;
        status: string;
        created_at: string;
    }>;
};

type Props = {
    dashboard: DashboardData;
};

const statIcons: LucideIcon[] = [WalletCards, TrendingUp, Receipt, Users];
const statTones = ['emerald', 'blue', 'amber', 'rose'] as const;
const chartColors = ['var(--primary)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

export default function Dashboard({ dashboard: data }: Props) {
    if (data.role === 'super_admin') {
        return <SuperAdminDashboard dashboard={data} />;
    }

    if (data.role === 'cashier') {
        return <CashierDashboard dashboard={data} />;
    }

    return <OwnerDashboard dashboard={data} />;
}

function OwnerDashboard({ dashboard: data }: Props) {
    const paymentData = [
        { name: 'Cash', value: data.paymentBreakdown?.cash ?? 0 },
        { name: 'Credit', value: data.paymentBreakdown?.credit ?? 0 },
        { name: 'Mobile', value: data.paymentBreakdown?.mobile ?? 0 },
        { name: 'VAT', value: data.paymentBreakdown?.vat ?? 0 },
    ].filter((item) => item.value > 0);
    const topProductMax = Math.max(...(data.topProducts ?? []).map((product) => product.raw_revenue), 1);

    return (
        <>
            <Head title="Dashboard" />
            <DashboardLayout
                title={data.business?.business_name ?? 'Owner Dashboard'}
                description="A command center for sales, cash flow, customers, inventory health, and decisions."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {data.stats.map((stat, index) => (
                        <MetricCard key={stat.label} stat={stat} icon={statIcons[index] ?? WalletCards} tone={statTones[index] ?? 'emerald'} />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.75fr)]">
                    <ChartPanel
                        title="Sales trend"
                        description="Revenue movement over the last 14 days."
                    >
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={data.salesTrend ?? data.chart}>
                                <defs>
                                    <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.03} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                                <YAxis tickLine={false} axisLine={false} fontSize={11} width={42} />
                                <Tooltip contentStyle={{ borderRadius: 10, borderColor: 'var(--border)' }} />
                                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="url(#dashboardRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartPanel>

                    <ChartPanel title="Cash, credit, mobile and VAT" description="30-day money mix from sales and completed payments.">
                        {paymentData.length > 0 ? (
                            <div className="grid gap-4">
                                <ResponsiveContainer width="100%" height={190}>
                                    <PieChart>
                                        <Pie data={paymentData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={4}>
                                            {paymentData.map((entry, index) => (
                                                <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: 10, borderColor: 'var(--border)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid gap-2">
                                    {paymentData.map((item, index) => (
                                        <div key={item.name} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                                            <span className="flex items-center gap-2">
                                                <span className="size-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                                                {item.name}
                                            </span>
                                            <span className="font-semibold">{formatCompactMoney(item.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <EmptyPanel message="No payment mix yet. Complete sales to populate this view." />
                        )}
                    </ChartPanel>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <ChartPanel title="Top products" description="Best performers by revenue in the last 30 days.">
                        {(data.topProducts ?? []).length > 0 ? (
                            <div className="space-y-4">
                                {(data.topProducts ?? []).map((product) => (
                                    <div key={product.name}>
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="font-medium">{product.name}</span>
                                            <span className="text-muted-foreground">{product.revenue}</span>
                                        </div>
                                        <div className="mt-2 h-2 rounded-full bg-muted">
                                            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max((product.raw_revenue / topProductMax) * 100, 6)}%` }} />
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">{product.quantity} units sold</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyPanel message="No top products yet. Sales will rank products automatically." />
                        )}
                    </ChartPanel>

                    <ChartPanel title="Inventory health" description="Stock risk, expiry risk, and total inventory value.">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <MiniInsight label="Low stock" value={String(data.inventoryHealth?.low_stock ?? 0)} icon={AlertTriangle} />
                            <MiniInsight label="Out of stock" value={String(data.inventoryHealth?.out_of_stock ?? 0)} icon={Package} />
                            <MiniInsight label="Expiring" value={String(data.inventoryHealth?.expiring_batches ?? 0)} icon={Lightbulb} />
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border bg-background p-4">
                                <p className="text-xs text-muted-foreground">Inventory at cost</p>
                                <p className="mt-2 text-lg font-semibold">{data.inventoryHealth?.inventory_cost_value ?? '0.00 ETB'}</p>
                            </div>
                            <div className="rounded-xl border bg-background p-4">
                                <p className="text-xs text-muted-foreground">Potential selling value</p>
                                <p className="mt-2 text-lg font-semibold">{data.inventoryHealth?.inventory_selling_value ?? '0.00 ETB'}</p>
                            </div>
                        </div>
                    </ChartPanel>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <ChartPanel title="Customer credit" description="Customer base and outstanding balances.">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <MiniInsight label="Customers" value={String(data.customerInsights?.total ?? 0)} icon={Users} />
                            <MiniInsight label="New this month" value={String(data.customerInsights?.new_this_month ?? 0)} icon={Sparkles} />
                            <MiniInsight label="With credit" value={String(data.customerInsights?.credit_customers ?? 0)} icon={CreditCard} />
                            <MiniInsight label="Pending credit" value={data.customerInsights?.pending_credit ?? '0.00 ETB'} icon={WalletCards} />
                        </div>
                    </ChartPanel>

                    <ChartPanel title="Recent activity" description="Latest sales, payments, and transaction movements.">
                        {(data.recentActivity ?? []).length > 0 ? (
                            <div className="space-y-3">
                                {(data.recentActivity ?? []).map((activity) => (
                                    <div key={`${activity.type}-${activity.title}-${activity.time}`} className="flex items-start gap-3 rounded-xl border bg-background px-3 py-2.5">
                                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <ActivityIcon type={activity.type} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="truncate text-sm font-medium">{activity.title}</p>
                                                <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">{activity.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyPanel message="No recent activity yet." />
                        )}
                    </ChartPanel>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <DashboardList
                        title="Low stock preview"
                        empty="No low-stock products yet."
                        items={(data.lowStock ?? []).map((item) => `${item.name}: ${item.stock} left, reorder at ${item.reorder}`)}
                        icon={AlertTriangle}
                    />

                    <DashboardList
                        title="Stagnant product alerts"
                        empty="No stagnant products detected."
                        items={(data.stagnantProducts ?? []).map((item) => `${item.name}: ${item.days_without_sale} days without sale, ${item.stock_on_hand} in stock`)}
                        icon={Lightbulb}
                    />

                    <DashboardList
                        title="Smart recommendations"
                        empty="No recommendations right now."
                        items={data.smartRecommendations ?? data.nextSteps ?? []}
                        icon={Sparkles}
                    />
                </div>
            </DashboardLayout>
        </>
    );
}

function CashierDashboard({ dashboard: data }: Props) {
    return (
        <>
            <Head title="Cashier Dashboard" />
            <DashboardLayout
                title="Cashier Dashboard"
                description="A focused daily workspace for sales, customers, payments, and receipts."
            >
                <div className="grid gap-4 md:grid-cols-4">
                    {data.stats.map((stat, index) => (
                        <StatCard
                            key={stat.label}
                            {...stat}
                            icon={[ShoppingCart, Receipt, Users, CreditCard][index] ?? Receipt}
                            tone={statTones[index] ?? 'emerald'}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <RevenueOverview
                        title="Today activity"
                        description="Hourly sales activity will appear once POS transactions begin."
                        data={data.chart}
                    />
                    <DashboardList
                        title="Cashier queue"
                        empty="Nothing waiting."
                        items={data.queue ?? []}
                        icon={Receipt}
                    />
                </div>
            </DashboardLayout>
        </>
    );
}

function SuperAdminDashboard({ dashboard: data }: Props) {
    return (
        <>
            <Head title="Super Admin Dashboard" />
            <DashboardLayout
                title="Super Admin Dashboard"
                description="Platform-wide view of businesses, users, subscriptions, and system growth."
            >
                <div className="grid gap-4 md:grid-cols-4">
                    {data.stats.map((stat, index) => (
                        <StatCard
                            key={stat.label}
                            {...stat}
                            icon={[Building2, Users, CreditCard, WalletCards][index] ?? Building2}
                            tone={statTones[index] ?? 'emerald'}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
                    <RevenueOverview
                        title="Platform growth"
                        description="Growth chart will use subscription and business activity as modules mature."
                        data={data.chart}
                    />
                    <DashboardList
                        title="Recent businesses"
                        empty="No businesses registered yet."
                        items={(data.recentBusinesses ?? []).map((business) => business.business_name)}
                        icon={Building2}
                    />
                </div>
            </DashboardLayout>
        </>
    );
}

function MetricCard({
    stat,
    icon: Icon,
    tone = 'emerald',
}: {
    stat: DashboardStat;
    icon: LucideIcon;
    tone?: 'emerald' | 'blue' | 'amber' | 'rose';
}) {
    const lineColor = tone === 'blue' ? 'var(--chart-2)' : tone === 'amber' ? 'var(--chart-3)' : tone === 'rose' ? 'var(--chart-4)' : 'var(--primary)';

    return (
        <article className="overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-normal">{stat.value}</p>
                    {stat.trend && <p className="mt-1 text-xs text-muted-foreground">{stat.trend}</p>}
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
            </div>
            <div className="mt-4 h-12">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stat.sparkline ?? []}>
                        <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2.5} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </article>
    );
}

function ChartPanel({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            {children}
        </section>
    );
}

function MiniInsight({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
    return (
        <div className="rounded-xl border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-lg font-semibold">{value}</p>
        </div>
    );
}

function EmptyPanel({ message }: { message: string }) {
    return (
        <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed bg-muted/25 px-4 text-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}

function ActivityIcon({ type }: { type: string }) {
    if (type === 'payment') {
        return <CreditCard className="size-4" />;
    }

    if (type === 'expense') {
        return <WalletCards className="size-4" />;
    }

    return <Receipt className="size-4" />;
}

function formatCompactMoney(value: number) {
    return new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value) + ' ETB';
}

function DashboardList({
    title,
    empty,
    items,
    icon: Icon,
}: {
    title: string;
    empty: string;
    items: string[];
    icon: LucideIcon;
}) {
    return (
        <section className="rounded-md border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
                <Icon className="size-5 text-primary" />
                <h2 className="font-semibold">{title}</h2>
            </div>
            <div className="mt-5 grid gap-3">
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{empty}</p>
                ) : (
                    items.map((item) => (
                        <div key={item} className="rounded-md border bg-background px-3 py-2 text-sm">
                            {item}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
