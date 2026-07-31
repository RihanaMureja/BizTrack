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
    Users,
    WalletCards,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { LucideIcon } from 'lucide-react';

type DashboardStat = {
    label: string;
    value: string;
    trend?: string;
};

type DashboardData = {
    role: 'super_admin' | 'owner' | 'cashier';
    business?: {
        business_name: string;
        business_type?: string | null;
    } | null;
    stats: DashboardStat[];
    chart: Array<{ label: string; value: number }>;
    lowStock?: Array<{ name: string; stock: number; reorder: number }>;
    stagnantProducts?: Array<{ id: number; name: string; days_without_sale: number; stock_on_hand: number; suggested_action: string | null }>;
    topProducts?: Array<{ name: string; quantity: number }>;
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

const statIcons: LucideIcon[] = [WalletCards, Receipt, Package, Users];
const statTones = ['emerald', 'blue', 'amber', 'rose'] as const;

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
    return (
        <>
            <Head title="Dashboard" />
            <DashboardLayout
                title={data.business?.business_name ?? 'Owner Dashboard'}
                description="Monitor revenue, customers, products, stock alerts, and the next setup steps."
            >
                <div className="grid gap-4 md:grid-cols-4">
                    {data.stats.map((stat, index) => (
                        <StatCard
                            key={stat.label}
                            {...stat}
                            icon={statIcons[index] ?? WalletCards}
                            tone={statTones[index] ?? 'emerald'}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <RevenueOverview
                        title="Revenue overview"
                        description="Weekly revenue will populate after the sales module is active."
                        data={data.chart}
                    />
                    <DashboardList
                        title="Low stock preview"
                        empty="No low-stock products yet."
                        items={(data.lowStock ?? []).map((item) => `${item.name}: ${item.stock} left`)}
                        icon={AlertTriangle}
                    />
                </div>

                <DashboardList
                    title="Stagnant product alerts"
                    empty="No stagnant products detected."
                    items={(data.stagnantProducts ?? []).map((item) => `${item.name}: ${item.days_without_sale} days without sale, ${item.stock_on_hand} in stock`)}
                    icon={Lightbulb}
                />

                <DashboardList
                    title="Recommended setup path"
                    empty="No setup tasks."
                    items={data.nextSteps ?? []}
                    icon={Building2}
                />
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
