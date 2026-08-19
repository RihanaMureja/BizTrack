import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { ThemePalettePreview } from '@/components/settings/theme-palette-preview';
import { Button } from '@/components/ui/button';
import { edit as editAppearance } from '@/routes/appearance';

type TenantTheme = {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    source: string;
    mode?: string;
    contrast_adjusted_at: string | null;
};

type AppearanceProps = {
    auth?: {
        user?: {
            role?: string;
            business_category?: string | null;
        } | null;
    };
    appearance?: {
        theme: TenantTheme;
        categoryPalette: {
            primary: string;
            secondary: string;
            accent: string;
            background: string;
            text: string;
            adjusted?: boolean;
        };
        business: {
            theme_mode?: string | null;
            theme_primary?: string | null;
            theme_secondary?: string | null;
            theme_accent?: string | null;
            logo?: string | null;
        } | null;
    };
};

type CategoryPalette = NonNullable<AppearanceProps['appearance']>['categoryPalette'];

export default function Appearance() {
    const { auth, tenantTheme, appearance } = usePage<{ tenantTheme?: TenantTheme } & AppearanceProps>().props;
    const isSuperAdmin = auth?.user?.role === 'super_admin';
    const theme = appearance?.theme ?? tenantTheme;
    const form = useForm({
        theme_mode: appearance?.business?.theme_mode ?? theme?.mode ?? 'default',
        theme_primary: appearance?.business?.theme_primary ?? theme?.primary ?? '#009B4D',
        theme_secondary: appearance?.business?.theme_secondary ?? theme?.secondary ?? '#0F766E',
        theme_accent: appearance?.business?.theme_accent ?? theme?.accent ?? '#F59E0B',
    });
    const previewTheme = formPreviewTheme(theme, appearance?.categoryPalette, form.data);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/settings/appearance', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Appearance" />

            <h1 className="sr-only">Appearance</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance"
                    description={isSuperAdmin
                        ? 'Choose whether the admin workspace uses light or dark mode.'
                        : 'Update the appearance settings for your account'}
                />
                <AppearanceTabs />
                {isSuperAdmin ? (
                    <div className="rounded-md border bg-card p-5 text-sm text-muted-foreground shadow-sm">
                        Super admin accounts use the platform appearance only. Business logo, category, and manual palettes are managed by business owners inside their own workspaces.
                    </div>
                ) : (
                    <>
                        <form onSubmit={submit} className="grid gap-5 rounded-md border bg-card p-5 shadow-sm">
                            <div>
                                <h2 className="font-semibold">Theme source</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Choose how BizTrack should style this business workspace.</p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-4">
                                {[
                                    ['logo', 'Logo palette'],
                                    ['category', 'Category palette'],
                                    ['manual', 'Manual colors'],
                                    ['default', 'BizTrack default'],
                                ].map(([value, label]) => (
                                    <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
                                        <input type="radio" checked={form.data.theme_mode === value} onChange={() => form.setData('theme_mode', value)} className="accent-primary" />
                                        {label}
                                    </label>
                                ))}
                            </div>
                            {form.errors.theme_mode && <p className="text-sm text-destructive">{form.errors.theme_mode}</p>}

                            {form.data.theme_mode === 'manual' && (
                                <div className="grid gap-5">
                                    <div className="grid gap-3 md:grid-cols-3">
                                        {manualPalettes.map((palette) => (
                                            <button
                                                key={palette.name}
                                                type="button"
                                                onClick={() => {
                                                    form.setData('theme_primary', palette.primary);
                                                    form.setData('theme_secondary', palette.secondary);
                                                    form.setData('theme_accent', palette.accent);
                                                }}
                                                className="rounded-md border bg-background p-3 text-left transition hover:border-primary"
                                            >
                                                <span className="text-sm font-medium">{palette.name}</span>
                                                <span className="mt-3 flex gap-2">
                                                    {[palette.primary, palette.secondary, palette.accent].map((color) => (
                                                        <span key={color} className="size-8 rounded-md border" style={{ backgroundColor: color }} />
                                                    ))}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <ColorField label="Primary" value={form.data.theme_primary} onChange={(value) => form.setData('theme_primary', value)} error={form.errors.theme_primary} />
                                        <ColorField label="Secondary" value={form.data.theme_secondary} onChange={(value) => form.setData('theme_secondary', value)} error={form.errors.theme_secondary} />
                                        <ColorField label="Accent" value={form.data.theme_accent} onChange={(value) => form.setData('theme_accent', value)} error={form.errors.theme_accent} />
                                    </div>
                                </div>
                            )}

                            {form.data.theme_mode === 'logo' && !appearance?.business?.logo && (
                                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                    No logo is uploaded yet. BizTrack will use the category palette until a logo exists.
                                </p>
                            )}

                            <Button type="submit" className="w-fit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : 'Save appearance'}
                            </Button>
                        </form>

                        <ThemePalettePreview theme={previewTheme} businessCategory={auth?.user?.business_category} />
                    </>
                )}
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance',
            href: editAppearance(),
        },
    ],
};

const manualPalettes = [
    { name: 'Elegant rose', primary: '#BE185D', secondary: '#7C3AED', accent: '#EA580C' },
    { name: 'Fresh health', primary: '#047857', secondary: '#0369A1', accent: '#0891B2' },
    { name: 'Premium navy', primary: '#1E3A5F', secondary: '#0F766E', accent: '#B45309' },
    { name: 'Warm retail', primary: '#B45309', secondary: '#166534', accent: '#DC2626' },
    { name: 'Modern violet', primary: '#4F46E5', secondary: '#0891B2', accent: '#F97316' },
    { name: 'Classic BizTrack', primary: '#009B4D', secondary: '#0F766E', accent: '#F59E0B' },
];

function formPreviewTheme(
    currentTheme: TenantTheme | undefined,
    categoryPalette: CategoryPalette | undefined,
    data: { theme_mode: string; theme_primary: string; theme_secondary: string; theme_accent: string },
): TenantTheme | undefined {
    if (data.theme_mode === 'manual') {
        return {
            primary: data.theme_primary,
            secondary: data.theme_secondary,
            accent: data.theme_accent,
            background: softBackground(data.theme_primary),
            text: '#0F172A',
            source: 'manual preview',
            mode: 'manual',
            contrast_adjusted_at: null,
        };
    }

    if (data.theme_mode === 'category' && categoryPalette) {
        return {
            ...categoryPalette,
            source: 'category preview',
            mode: 'category',
            contrast_adjusted_at: categoryPalette.adjusted ? 'pending' : null,
        };
    }

    return currentTheme;
}

function softBackground(hex: string) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        return '#F8FAFC';
    }

    const rgb = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((part) => parseInt(part, 16));
    const mixed = rgb.map((value) => Math.round(value * 0.04 + 255 * 0.96));

    return `#${mixed.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function ColorField({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) {
    return (
        <label className="grid gap-2 text-sm font-medium">
            {label}
            <div className="rounded-md border bg-background p-3">
                <input
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-16 w-full cursor-pointer rounded-md border-0 bg-transparent p-0"
                    aria-label={`${label} color`}
                />
                <details className="mt-2 text-xs text-muted-foreground">
                    <summary className="cursor-pointer">Advanced color value</summary>
                    <input
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        className="mt-2 w-full rounded-md border bg-background px-2 py-1 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                    />
                </details>
            </div>
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}
