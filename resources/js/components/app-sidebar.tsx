import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BadgeDollarSign,
    BadgePercent,
    Boxes,
    Building2,
    ChartNoAxesCombined,
    ChartColumnIncreasing,
    CreditCard,
    KeyRound,
    LayoutGrid,
    Package,
    Receipt,
    ScrollText,
    Settings,
    ShieldCheck,
    Tags,
    UserRound,
    Users,
    WalletCards,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { SharedData } from '@/types';

const icons = {
    BadgeDollarSign,
    BadgePercent,
    Bell,
    Boxes,
    Building2,
    ChartNoAxesCombined,
    ChartColumnIncreasing,
    CreditCard,
    KeyRound,
    LayoutGrid,
    Package,
    Receipt,
    ScrollText,
    Settings,
    ShieldCheck,
    Tags,
    UserRound,
    Users,
    WalletCards,
};

export function AppSidebar() {
    const { navigation = [] } = usePage<SharedData>().props;
    const mainNavItems = navigation.map((item) => ({
        ...item,
        icon: icons[item.icon as keyof typeof icons] ?? LayoutGrid,
    }));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="h-16 px-3" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
