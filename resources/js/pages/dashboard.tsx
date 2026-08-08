import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BadgeDollarSign,
    Building2,
    CheckCircle2,
    Clock3,
    CreditCard,
    Lightbulb,
    Package,
    Receipt,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Trophy,
    Users,
    WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { RevenueOverview } from '@/components/charts/revenue-overview';
import { StatCard } from '@/components/stat-card/stat-card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { businessTypeLabel } from '@/lib/business-types';
import { cn, formatMoney } from '@/lib/utils';
import { dashboard as dashboardRoute } from '@/routes';

type DashboardStat = {
    key?: string;
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
    businessType?: string | null;
    focus?: string;
    subtitle?: string | null;
    sections?: string[];
    stats: DashboardStat[];
    chart: Array<{ label: string; value: number }>;
    lowStock?: Array<{ name: string; stock: number; reorder: number }>;
    stagnantProducts?: Array<{
        id: number;
        name: string;
        days_without_sale: number;
        stock_on_hand: number;
        suggested_action: string | null;
    }>;
    expiringProducts?: Array<{
        name: string;
        quantity: number;
        days_left: number;
        expires_at: string;
    }>;
    stockValue?: {
        total: number;
        items: Array<{ name: string; value: number }>;
    };
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

const statIconByKey: Record<string, LucideIcon> = {
    revenue_today: WalletCards,
    sales_today: Receipt,
    expenses_today: TrendingDown,
    products: Package,
    low_stock: AlertTriangle,
    expiring_soon: Clock3,
    stock_value: BadgeDollarSign,
    stagnant_count: Lightbulb,
};

const listSectionKeys = new Set([
    'lowStock',
    'stagnant',
    'expiring',
    'topProducts',
    'stockValue',
    'setup',
]);

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
    const sectionKeys = data.sections ?? [
        'chart',
        'lowStock',
        'stagnant',
        'setup',
    ];
    const typeLabel = businessTypeLabel(data.businessType);

    const renderSection = (key: string): ReactNode => {
        switch (key) {
            case 'chart':
                return (
                    <RevenueOverview
                        title="Revenue overview"
                        description="Weekly revenue will populate after the sales module is active."
                        data={data.chart}
                    />
                );
            case 'lowStock':
                return (
                    <DashboardList
                        title="Low stock alerts"
                        empty="All products are well-stocked"
                        emptyIcon={CheckCircle2}
                        items={(data.lowStock ?? []).map(
                            (item) =>
                                `${item.name}: ${item.stock} left (reorder at ${item.reorder})`,
                        )}
                        icon={AlertTriangle}
                        tone="amber"
                    />
                );
            case 'stagnant':
                return (
                    <DashboardList
                        title="Stagnant product alerts"
                        empty="No stagnant products detected."
                        items={(data.stagnantProducts ?? []).map(
                            (item) =>
                                `${item.name}: ${item.days_without_sale} days without sale, ${item.stock_on_hand} in stock`,
                        )}
                        icon={Lightbulb}
                    />
                );
            case 'expiring':
                return (
                    <DashboardList
                        title="Expiring soon"
                        empty="No products are expiring within the next 30 days."
                        items={(data.expiringProducts ?? []).map(
                            (item) =>
                                `${item.name}: ${item.quantity} units expire in ${item.days_left} days (${item.expires_at})`,
                        )}
                        icon={Clock3}
                        tone="rose"
                    />
                );
            case 'topProducts':
                return (
                    <DashboardList
                        title="Top selling products"
                        empty="Sales data will appear once the first POS transactions are recorded."
                        items={(data.topProducts ?? []).map(
                            (item) =>
                                `${item.name}: ${item.quantity} units sold`,
                        )}
                        icon={Trophy}
                        tone="blue"
                    />
                );
            case 'stockValue':
                return (
                    <StockValueSection
                        total={data.stockValue?.total ?? 0}
                        items={data.stockValue?.items ?? []}
                    />
                );
            case 'setup':
                return (
                    <DashboardList
                        title="Recommended setup path"
                        empty="No setup tasks."
                        items={data.nextSteps ?? []}
                        icon={TrendingUp}
                        tone="emerald"
                        numbered
                    />
                );
            default:
                return null;
        }
    };

    const sections: ReactNode[] = [];

    for (let index = 0; index < sectionKeys.length; index++) {
        const key = sectionKeys[index];
        const next = sectionKeys[index + 1];
        const isPairedGrid =
            (key === 'chart' && listSectionKeys.has(next)) ||
            (listSectionKeys.has(key) && next === 'chart');

        if (isPairedGrid) {
            sections.push(
                <div
                    key={`${key}-${next}`}
                    className="grid gap-6 xl:grid-cols-[1fr_380px]"
                >
                    {renderSection(key)}
                    {renderSection(next)}
                </div>,
            );
            index++;
        } else {
            sections.push(<div key={key}>{renderSection(key)}</div>);
        }
    }

    return (
        <>
            <Head title="Dashboard" />
            <DashboardLayout
                title={data.business?.business_name ?? 'Owner Dashboard'}
                description={
                    data.subtitle ??
                    'Monitor revenue, customers, products, stock alerts, and the next setup steps.'
                }
            >
                {typeLabel && typeLabel !== 'your business' && (
                    <div className="mb-4 flex items-center gap-2 text-sm">
                        <span className="rounded-full border bg-card px-3 py-1 font-medium text-muted-foreground">
                            {typeLabel}
                        </span>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {data.stats.map((stat, index) => (
                        <StatCard
                            key={stat.label}
                            {...stat}
                            icon={
                                stat.key
                                    ? (statIconByKey[stat.key] ?? WalletCards)
                                    : (statIcons[index] ?? WalletCards)
                            }
                            tone={statTones[index] ?? 'emerald'}
                        />
                    ))}
                </div>

                {sections}
            </DashboardLayout>
        </>
    );
}

function StockValueSection({
    total,
    items,
}: {
    total: number;
    items: Array<{ name: string; value: number }>;
}) {
    return (
        <section className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-2.5">
                <BadgeDollarSign className="size-5 text-primary" />
                <h2 className="text-base font-semibold">Inventory value</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
                Cost of the stock you currently hold across your inventory
                batches.
            </p>
            <p className="mt-4 text-3xl font-bold tracking-tight text-primary">
                {formatMoney(total)}
            </p>

            <div className="mt-5 grid gap-2.5">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                        <BadgeDollarSign className="size-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground/60">
                            Record purchases or restocks to see your stock
                            value.
                        </p>
                    </div>
                ) : (
                    items.map((item, i) => (
                        <div
                            key={`${item.name}-${i}`}
                            className="flex items-center justify-between gap-3 rounded-lg border bg-background/50 px-4 py-3 text-sm"
                        >
                            <span className="flex items-center gap-2 font-medium">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-primary">
                                    {i + 1}
                                </span>
                                {item.name}
                            </span>
                            <span className="text-muted-foreground">
                                {formatMoney(item.value)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </section>
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
                            icon={
                                [ShoppingCart, Receipt, Users, CreditCard][
                                    index
                                ] ?? Receipt
                            }
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
                            icon={
                                [Building2, Users, CreditCard, WalletCards][
                                    index
                                ] ?? Building2
                            }
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
                            (b) =>
                                `${b.business_name}${b.business_type ? ` (${b.business_type})` : ''}`,
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
                        {EmptyIcon && (
                            <EmptyIcon className="size-8 text-muted-foreground/30" />
                        )}
                        <p className="text-sm text-muted-foreground/60">
                            {empty}
                        </p>
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
                                <span
                                    className={cn(
                                        'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                        toneIcon[tone],
                                        'bg-muted',
                                    )}
                                >
                                    {i + 1}
                                </span>
                            )}
                            <span className="flex-1 leading-relaxed">
                                {item}
                            </span>
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
