import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Building2,
    CheckCircle2,
    CreditCard,
    Lightbulb,
    Package,
    Receipt,
    ShoppingCart,
    TrendingUp,
    Users,
    WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RevenueOverview } from '@/components/charts/revenue-overview';
import { StatCard } from '@/components/stat-card/stat-card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { cn } from '@/lib/utils';
import { dashboard as dashboardRoute } from '@/routes';

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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {data.stats.map((stat, index) => (
                        <StatCard
                            key={stat.label}
                            {...stat}
                            icon={statIcons[index] ?? WalletCards}
                            tone={statTones[index] ?? 'emerald'}
                        />
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                    <RevenueOverview
                        title="Revenue overview"
                        description="Weekly revenue will populate after the sales module is active."
                        data={data.chart}
                    />
                    <DashboardList
                        title="Low stock alerts"
                        empty="All products are well-stocked"
                        emptyIcon={CheckCircle2}
                        items={(data.lowStock ?? []).map(
                            (item) => `${item.name}: ${item.stock} left (reorder at ${item.reorder})`,
                        )}
                        icon={AlertTriangle}
                        tone="amber"
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
                    icon={TrendingUp}
                    tone="emerald"
                    numbered
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {data.stats.map((stat, index) => (
                        <StatCard
                            key={stat.label}
                            {...stat}
                            icon={[ShoppingCart, Receipt, Users, CreditCard][index] ?? Receipt}
                            tone={statTones[index] ?? 'emerald'}
                        />
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                    <RevenueOverview
                        title="Today activity"
                        description="Hourly sales activity will appear once POS transactions begin."
                        data={data.chart}
                    />
                    <DashboardList
                        title="Cashier queue"
                        empty="Nothing waiting in queue"
                        emptyIcon={CheckCircle2}
                        items={data.queue ?? []}
                        icon={Receipt}
                        tone="blue"
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {data.stats.map((stat, index) => (
                        <StatCard
                            key={stat.label}
                            {...stat}
                            icon={[Building2, Users, CreditCard, WalletCards][index] ?? Building2}
                            tone={statTones[index] ?? 'emerald'}
                        />
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                    <RevenueOverview
                        title="Platform growth"
                        description="Growth chart will use subscription and business activity as modules mature."
                        data={data.chart}
                    />
                    <DashboardList
                        title="Recent businesses"
                        empty="No businesses registered yet"
                        emptyIcon={Building2}
                        items={(data.recentBusinesses ?? []).map(
                            (b) => `${b.business_name}${b.business_type ? ` (${b.business_type})` : ''}`,
                        )}
                        icon={Building2}
                        tone="emerald"
                    />
                </div>
            </DashboardLayout>
        </>
    );
}

function DashboardList({
    title,
    empty,
    emptyIcon: EmptyIcon,
    items,
    icon: Icon,
    tone = 'emerald',
    numbered = false,
}: {
    title: string;
    empty: string;
    emptyIcon?: LucideIcon;
    items: string[];
    icon: LucideIcon;
    tone?: 'emerald' | 'blue' | 'amber' | 'rose';
    numbered?: boolean;
}) {
    const toneBorder = {
        emerald: 'border-emerald-200 dark:border-emerald-900',
        blue: 'border-sky-200 dark:border-sky-900',
        amber: 'border-amber-200 dark:border-amber-900',
        rose: 'border-rose-200 dark:border-rose-900',
    };
    const toneIcon = {
        emerald: 'text-emerald-600 dark:text-emerald-400',
        blue: 'text-sky-600 dark:text-sky-400',
        amber: 'text-amber-600 dark:text-amber-400',
        rose: 'text-rose-600 dark:text-rose-400',
    };

    return (
        <section className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-2.5">
                <Icon className={cn('size-5', toneIcon[tone])} />
                <h2 className="text-base font-semibold">{title}</h2>
            </div>
            <div className="mt-5 grid gap-2.5">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                        {EmptyIcon && <EmptyIcon className="size-8 text-muted-foreground/30" />}
                        <p className="text-sm text-muted-foreground/60">{empty}</p>
                    </div>
                ) : (
                    items.map((item, i) => (
                        <div
                            key={`${item}-${i}`}
                            className={cn(
                                'group flex items-start gap-3 rounded-lg border bg-background/50 px-4 py-3 text-sm transition-all hover:bg-background',
                                numbered && toneBorder[tone],
                            )}
                        >
                            {numbered && (
                                <span className={cn(
                                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                    toneIcon[tone],
                                    'bg-muted',
                                )}>
                                    {i + 1}
                                </span>
                            )}
                            <span className="flex-1 leading-relaxed">{item}</span>
                            {numbered && (
                                <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
                            )}
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
            href: dashboardRoute(),
        },
    ],
};
