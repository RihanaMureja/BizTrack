type Rgb = { r: number; g: number; b: number };

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };
const DARK_BACKGROUND: Rgb = { r: 32, g: 36, b: 43 };

export const DEFAULT_BRAND_COLOR = '#009b4d';

export type BrandColorPreset = {
    name: string;
    value: string;
};

export const brandPresets: BrandColorPreset[] = [
    { name: 'BizTrack green', value: '#009b4d' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Cyan', value: '#0891b2' },
    { name: 'Sky', value: '#0284c7' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Slate', value: '#334155' },
];

const BRAND_VAR_KEYS = [
    '--brand-primary',
    '--brand-primary-foreground',
    '--brand-primary-light',
    '--brand-primary-dark',
    '--brand-primary-muted',
    '--primary',
    '--primary-foreground',
    '--ring',
    '--accent',
    '--accent-foreground',
    '--chart-1',
    '--sidebar-primary',
    '--sidebar-primary-foreground',
    '--sidebar-accent',
    '--sidebar-accent-foreground',
    '--sidebar-ring',
] as const;

export function normalizeHex(hex: string): string | null {
    const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());

    return match ? `#${match[1].toLowerCase()}` : null;
}

const clamp = (value: number): number =>
    Math.max(0, Math.min(255, Math.round(value)));

const hexToRgb = (hex: string): Rgb => {
    const normalized = normalizeHex(hex) ?? DEFAULT_BRAND_COLOR;
    const value = parseInt(normalized.slice(1), 16);

    return {
        r: (value >> 16) & 0xff,
        g: (value >> 8) & 0xff,
        b: value & 0xff,
    };
};

const rgbToHex = ({ r, g, b }: Rgb): string =>
    `#${[r, g, b].map((channel) => clamp(channel).toString(16).padStart(2, '0')).join('')}`;

const mix = (a: Rgb, b: Rgb, weightA: number): Rgb => ({
    r: a.r * weightA + b.r * (1 - weightA),
    g: a.g * weightA + b.g * (1 - weightA),
    b: a.b * weightA + b.b * (1 - weightA),
});

const channelLuminance = (value: number): number => {
    const channel = value / 255;

    return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = ({ r, g, b }: Rgb): number =>
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b);

const foregroundFor = (rgb: Rgb): string =>
    relativeLuminance(rgb) > 0.4 ? '#17171c' : '#ffffff';

/**
 * Compute the CSS custom-property overrides for a brand color in the given mode.
 *
 * The named --brand-* variables are the source values; the remaining aliases
 * map them onto the existing theme tokens (primary, ring, accent, chart,
 * sidebar) so every part of the UI that already consumes those tokens picks
 * up the brand color automatically.
 */
export function brandCssVariables(
    hex: string,
    isDark: boolean,
): Record<string, string> {
    const brand = hexToRgb(hex);
    const base = isDark ? mix(brand, WHITE, 0.3) : brand;
    const foreground = foregroundFor(base);
    const light = mix(base, WHITE, isDark ? 0.42 : 0.55);
    const dark = mix(base, BLACK, 0.3);
    const muted = isDark
        ? mix(base, DARK_BACKGROUND, 0.32)
        : mix(base, WHITE, 0.9);
    const mutedForeground = isDark ? mix(base, WHITE, 0.82) : dark;
    const ring = isDark ? mix(base, WHITE, 0.18) : mix(base, BLACK, 0.08);

    return {
        '--brand-primary': rgbToHex(base),
        '--brand-primary-foreground': foreground,
        '--brand-primary-light': rgbToHex(light),
        '--brand-primary-dark': rgbToHex(dark),
        '--brand-primary-muted': rgbToHex(muted),
        '--primary': rgbToHex(base),
        '--primary-foreground': foreground,
        '--ring': rgbToHex(ring),
        '--accent': rgbToHex(muted),
        '--accent-foreground': rgbToHex(mutedForeground),
        '--chart-1': rgbToHex(base),
        '--sidebar-primary': rgbToHex(base),
        '--sidebar-primary-foreground': foreground,
        '--sidebar-accent': rgbToHex(muted),
        '--sidebar-accent-foreground': rgbToHex(mutedForeground),
        '--sidebar-ring': rgbToHex(base),
    };
}

export function applyBrandColor(
    hex: string | null | undefined,
    isDark: boolean,
): void {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;
    const normalized = hex ? normalizeHex(hex) : null;

    if (!normalized) {
        for (const key of BRAND_VAR_KEYS) {
            root.style.removeProperty(key);
        }

        return;
    }

    const variables = brandCssVariables(normalized, isDark);

    for (const [key, value] of Object.entries(variables)) {
        root.style.setProperty(key, value);
    }
}

export function initializeBrandColor(): void {
    if (typeof document === 'undefined') {
        return;
    }

    const hex = document.documentElement.getAttribute('data-brand-color');
    const isDark = document.documentElement.classList.contains('dark');

    applyBrandColor(hex, isDark);
}
