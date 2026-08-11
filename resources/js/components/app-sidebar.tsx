import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BadgeDollarSign,
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
import { BusinessBranding } from '@/components/business-branding';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { SharedData } from '@/types';

const icons = {
    BadgeDollarSign,
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
    const { auth, navigation = [] } = usePage<SharedData>().props;
    const isOwner = auth.user?.role === 'owner';
    const hasBusinessName = Boolean(auth.user?.display_business_name);
    const mainNavGroups = navigation.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
            ...item,
            icon: icons[item.icon as keyof typeof icons] ?? LayoutGrid,
        })),
    }));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="h-16 px-3"
                            asChild
                        >
                            <Link href={dashboard()} prefetch>
                                {isOwner && hasBusinessName ? (
                                    <BusinessBranding />
                                ) : (
                                    <AppLogo />
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={mainNavGroups} />
            </SidebarContent>
        </Sidebar>
    );
}
