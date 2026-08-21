import { Link } from '@inertiajs/react';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavGroup } from '@/types';

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.label} className="px-2 py-2">
                    {!group.isCollapsible ? (
                        <>
                            <SidebarGroupLabel className="text-sidebar-foreground/50">
                                {group.label}
                            </SidebarGroupLabel>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={`${group.label}-${item.title}`}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isCurrentUrl(item.href)}
                                            tooltip={{ children: item.title }}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </>
                    ) : (
                        <>
                            <SidebarGroupLabel className="text-sidebar-foreground/50 sr-only">
                                {group.label}
                            </SidebarGroupLabel>
                            <SidebarMenu>
                                <Collapsible asChild defaultOpen={group.items.some((item) => isCurrentUrl(item.href))}>
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={{ children: group.label }}>
                                                {(() => {
                                                    const Icon = group.items[0]?.icon || LayoutGrid;
                                                    return <Icon />;
                                                })()}
                                                <span>{group.label}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {group.items.map((item) => (
                                                    <SidebarMenuSubItem key={`${group.label}-${item.title}`}>
                                                        <SidebarMenuSubButton asChild isActive={isCurrentUrl(item.href)}>
                                                            <Link href={item.href} prefetch>
                                                                <span>{item.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            </SidebarMenu>
                        </>
                    )}
                </SidebarGroup>
            ))}
        </>
    );
}
