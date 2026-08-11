import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { visualForBusinessCategory } from '@/components/business/category-visuals';

type TenantTheme = {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    source: string;
    contrast_adjusted_at: string | null;
};

export function ThemePalettePreview({ theme, businessCategory }: { theme?: TenantTheme; businessCategory?: string | null }) {
    if (!theme) {
        return null;
    }

    const colors = [
        ['Primary', theme.primary],
        ['Secondary', theme.secondary],
        ['Accent', theme.accent],
        ['Background', theme.background],
        ['Text', theme.text],
    ];

    const visual = visualForBusinessCategory(businessCategory);
    const Icon = visual.Icon;

    return (
        <section className="rounded-md border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-semibold">Business palette</h2>
                    <p className="mt-1 text-sm text-muted-foreground">This palette controls the workspace background, sidebar, buttons, cards, charts, and active states.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary">Source: {theme.source}</Badge>
                    {theme.contrast_adjusted_at && <Badge>Contrast adjusted</Badge>}
                </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-5">
                {colors.map(([label, color]) => (
                    <div key={label} className="rounded-md border bg-background p-3">
                        <div className="h-14 rounded-md border" style={{ backgroundColor: color }} />
                        <p className="mt-2 text-xs font-medium">{label}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{color}</p>
                    </div>
                ))}
            </div>

            <div className="mt-5 rounded-md border p-4" style={{ backgroundColor: theme.background, color: theme.text }}>
                <p className="text-sm font-semibold">Live preview</p>
                <p className="mt-1 text-xs opacity-75">Buttons, highlights, charts, and sidebar active states follow this palette.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button">Primary action</Button>
                    <Button type="button" variant="outline">Secondary action</Button>
                    <span className="rounded-md px-3 py-2 text-sm font-medium" style={{ backgroundColor: theme.accent, color: '#ffffff' }}>Accent badge</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-[12rem_1fr]">
                    <div className="rounded-md border p-3" style={{ backgroundColor: mix(theme.primary, '#ffffff', 0.88) }}>
                        <div className="mb-3 h-8 rounded-md" style={{ backgroundColor: theme.primary }} />
                        {['Dashboard', 'Catalog', 'Sales'].map((item, index) => (
                            <div
                                key={item}
                                className="mb-2 rounded-md px-3 py-2 text-xs font-medium"
                                style={{
                                    backgroundColor: index === 1 ? mix(theme.accent, '#ffffff', 0.78) : 'transparent',
                                    color: theme.text,
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                    <div className="rounded-md border bg-white p-4 text-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-md" style={{ backgroundColor: theme.accent, color: readableOn(theme.accent) }}>
                                <Icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Sample product card</p>
                                <p className="text-xs text-slate-500">Category visuals and brand colors work together.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
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
