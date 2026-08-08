import { router } from '@inertiajs/react';
import { useEffect, useSyncExternalStore } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { applyBrandColor } from '@/lib/brand-color';

const listeners = new Set<() => void>();
let currentBrandColor: string | null = null;

const subscribe = (callback: () => void): (() => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const setBrandColor = (hex: string | null | undefined): void => {
    const normalized = typeof hex === 'string' && hex ? hex : null;

    if (normalized === currentBrandColor) {
        return;
    }

    currentBrandColor = normalized;
    listeners.forEach((listener) => listener());
};

const syncBrandColor = (event: {
    detail: { page: { props: Record<string, unknown> } };
}): void => {
    const { brandColor } = event.detail.page.props;
    setBrandColor(typeof brandColor === 'string' ? brandColor : null);
};

// Seed from the server-rendered `data-brand-color` attribute and keep the value
// in sync across client-side navigations. This keeps `useBrandColor()` usable
// outside the Inertia React context (e.g. providers wrapped via `withApp`),
// which cannot call `usePage()`.
if (typeof document !== 'undefined') {
    setBrandColor(document.documentElement.getAttribute('data-brand-color'));

    // `success` fires on every completed visit (with the fresh page props);
    // `navigate` covers the initial load and history-driven swaps.
    router.on('success', syncBrandColor);
    router.on('navigate', syncBrandColor);
}

export function useBrandColor(): void {
    const { resolvedAppearance } = useAppearance();
    const brandColor = useSyncExternalStore(
        subscribe,
        () => currentBrandColor,
        () => null,
    );

    useEffect(() => {
        applyBrandColor(brandColor, resolvedAppearance === 'dark');
    }, [brandColor, resolvedAppearance]);
}
