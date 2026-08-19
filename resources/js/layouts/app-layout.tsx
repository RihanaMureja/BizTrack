import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { useAppearance } from '@/hooks/use-appearance';
import type { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { CSSProperties } from 'react';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { tenantTheme } = usePage<{ tenantTheme?: TenantTheme }>().props;
    const { resolvedAppearance } = useAppearance();
    const themeVariables = themeStyle(tenantTheme, resolvedAppearance === 'dark');

    useEffect(() => {
        applyRootTenantTheme(themeVariables);

        return () => removeRootTenantTheme(themeVariables);
    }, [themeVariables]);

    return (
        <div style={themeVariables} className="min-h-svh bg-background text-foreground">
            <AppLayoutTemplate breadcrumbs={breadcrumbs}>
                {children}
            </AppLayoutTemplate>
        </div>
    );
}

type TenantTheme = {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
};

function themeStyle(theme?: TenantTheme, isDark = false): CSSProperties {
    const primary = validHex(theme?.primary) ? theme.primary : undefined;
    const secondary = validHex(theme?.secondary) ? theme.secondary : undefined;
    const accent = validHex(theme?.accent) ? theme.accent : undefined;
    const background = validHex(theme?.background) ? theme.background : primary ? mix(primary, '#ffffff', 0.96) : undefined;
    const text = validHex(theme?.text) ? theme.text : undefined;

    if (!primary && !secondary && !accent && !background && !text) {
        return {};
    }

    if (isDark) {
        const darkPrimary = primary ? tintForDark(primary) : '#4ade80';
        const darkSecondary = secondary ? mix(secondary, '#111827', 0.74) : '#1f2937';
        const darkAccent = accent ? tintForDark(accent, 0.2) : '#fbbf24';
        const darkBackground = primary ? mix(primary, '#020617', 0.9) : '#08111f';
        const darkCard = primary ? mix(primary, '#0f172a', 0.84) : '#111827';
        const darkSidebar = primary ? mix(primary, '#020617', 0.82) : '#0f172a';
        const darkSidebarAccent = accent ? mix(accent, '#111827', 0.72) : '#1f2937';
        const darkMuted = secondary ? mix(secondary, '#111827', 0.82) : '#1f2937';
        const darkBorder = primary ? mix(primary, '#ffffff', 0.78) : '#334155';

        return {
            '--background': darkBackground,
            '--foreground': '#f1f8f4',
            '--card': darkCard,
            '--card-foreground': '#f7fbf8',
            '--popover': mix(darkCard, '#020617', 0.18),
            '--popover-foreground': '#f7fbf8',
            '--primary': darkPrimary,
            '--primary-foreground': readableOn(darkPrimary),
            '--secondary': darkSecondary,
            '--secondary-foreground': '#edf7f1',
            '--muted': darkMuted,
            '--muted-foreground': '#b7c8bd',
            '--accent': darkSidebarAccent,
            '--accent-foreground': '#f7fbf8',
            '--border': darkBorder,
            '--input': mix(darkBorder, '#020617', 0.38),
            '--ring': darkPrimary,
            '--chart-1': darkPrimary,
            '--chart-2': secondary ? tintForDark(secondary, 0.18) : '#38bdf8',
            '--chart-3': darkAccent,
            '--chart-4': accent ? mix(accent, '#ffffff', 0.36) : '#f472b6',
            '--chart-5': secondary ? mix(secondary, '#ffffff', 0.24) : '#a78bfa',
            '--sidebar': darkSidebar,
            '--sidebar-foreground': '#f1f8f4',
            '--sidebar-primary': darkPrimary,
            '--sidebar-primary-foreground': readableOn(darkPrimary),
            '--sidebar-accent': darkSidebarAccent,
            '--sidebar-accent-foreground': '#f7fbf8',
            '--sidebar-border': mix(darkBorder, '#020617', 0.2),
            '--sidebar-ring': darkPrimary,
        } as CSSProperties;
    }

    return {
        ...(primary ? {
            '--primary': primary,
            '--primary-foreground': readableOn(primary),
            '--ring': primary,
            '--chart-1': primary,
            '--sidebar-primary': primary,
            '--sidebar-primary-foreground': readableOn(primary),
        } : {}),
        ...(secondary ? {
            '--secondary': mix(secondary, '#ffffff', 0.88),
            '--secondary-foreground': readableOn(mix(secondary, '#ffffff', 0.88)),
            '--chart-2': secondary,
            '--sidebar-ring': secondary,
        } : {}),
        ...(accent ? {
            '--chart-3': accent,
            '--chart-4': mix(accent, '#000000', 0.18),
            '--accent': mix(accent, '#ffffff', 0.82),
            '--accent-foreground': readableOn(mix(accent, '#ffffff', 0.82)),
            '--sidebar-accent': mix(accent, '#ffffff', 0.82),
            '--sidebar-accent-foreground': readableOn(mix(accent, '#ffffff', 0.82)),
        } : {}),
        ...(background ? {
            '--background': background,
            '--card': mix(background, '#ffffff', 0.72),
            '--popover': mix(background, '#ffffff', 0.76),
            '--muted': mix(background, primary ?? '#64748b', 0.08),
            '--border': mix(primary ?? '#64748b', '#ffffff', 0.74),
            '--input': mix(primary ?? '#64748b', '#ffffff', 0.74),
            '--sidebar': mix(primary ?? background, '#ffffff', 0.9),
            '--sidebar-border': mix(primary ?? '#64748b', '#ffffff', 0.68),
        } : {}),
        ...(text ? {
            '--foreground': text,
            '--card-foreground': text,
            '--popover-foreground': text,
            '--muted-foreground': mix(text, '#ffffff', 0.36),
            '--sidebar-foreground': text,
        } : {}),
    } as CSSProperties;
}

function applyRootTenantTheme(variables: CSSProperties) {
    if (typeof document === 'undefined') {
        return;
    }

    Object.entries(variables).forEach(([property, value]) => {
        if (typeof value === 'string') {
            document.documentElement.style.setProperty(property, value);
        }
    });
}

function removeRootTenantTheme(variables: CSSProperties) {
    if (typeof document === 'undefined') {
        return;
    }

    Object.keys(variables).forEach((property) => {
        document.documentElement.style.removeProperty(property);
    });
}

function validHex(value?: string): value is string {
    return Boolean(value && /^#[0-9A-Fa-f]{6}$/.test(value));
}

function mix(from: string, to: string, weight: number) {
    const fromRgb = hexToRgb(from);
    const toRgb = hexToRgb(to);
    const mixed = fromRgb.map((value, index) => Math.round(value * (1 - weight) + toRgb[index] * weight));

    return `#${mixed.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function readableOn(hex: string) {
    return contrast(hex, '#ffffff') >= 4.5 ? '#ffffff' : '#0f172a';
}

function tintForDark(hex: string, whiteWeight = 0.32) {
    const tinted = mix(hex, '#ffffff', whiteWeight);

    return contrast(tinted, '#020617') >= 4.5 ? tinted : mix(hex, '#ffffff', 0.48);
}

function contrast(a: string, b: string) {
    const light = Math.max(luminance(a), luminance(b));
    const dark = Math.min(luminance(a), luminance(b));

    return (light + 0.05) / (dark + 0.05);
}

function luminance(hex: string) {
    const [r, g, b] = hexToRgb(hex).map((value) => {
        const channel = value / 255;

        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string) {
    return [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((part) => parseInt(part, 16));
}
