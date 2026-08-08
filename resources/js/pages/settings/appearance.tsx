import { Head, useForm } from '@inertiajs/react';
import { Brush, Undo2 } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppearance } from '@/hooks/use-appearance';
import {
    brandCssVariables,
    brandPresets,
    normalizeHex,
} from '@/lib/brand-color';
import { cn } from '@/lib/utils';

type Props = {
    brandColor?: string | null;
    canManageBrandColor?: boolean;
};

export default function Appearance({ brandColor, canManageBrandColor }: Props) {
    const { resolvedAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const form = useForm({
        brand_color: brandColor ?? '',
    });

    const selected = normalizeHex(form.data.brand_color || brandColor || '');
    const preview = selected ? brandCssVariables(selected, isDark) : null;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.put('/settings/appearance', { preserveScroll: true });
    };

    const resetToDefault = () => {
        form.setData('brand_color', '');
        form.put('/settings/appearance', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Update the appearance settings for your account and business"
                />
                <AppearanceTabs />

                {canManageBrandColor && (
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-md border bg-card p-4 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Brush className="size-5 text-primary" />
                                <div>
                                    <h2 className="font-semibold">
                                        Brand color
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Your brand color is applied to the
                                        dashboard, sidebar, buttons, and charts.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Choose a preset</Label>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {brandPresets.map((preset) => {
                                            const isActive =
                                                form.data.brand_color ===
                                                preset.value;

                                            return (
                                                <button
                                                    key={preset.value}
                                                    type="button"
                                                    title={preset.name}
                                                    aria-label={preset.name}
                                                    aria-pressed={isActive}
                                                    onClick={() =>
                                                        form.setData(
                                                            'brand_color',
                                                            preset.value,
                                                        )
                                                    }
                                                    className={cn(
                                                        'size-9 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-105 dark:border-neutral-800',
                                                        isActive &&
                                                            'ring-2 ring-primary ring-offset-2 ring-offset-card dark:ring-offset-card',
                                                    )}
                                                    style={{
                                                        backgroundColor:
                                                            preset.value,
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>

                                    <div className="mt-2 grid gap-2">
                                        <Label htmlFor="custom_brand_color">
                                            Custom color
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                id="custom_brand_color"
                                                type="color"
                                                value={selected ?? '#009b4d'}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'brand_color',
                                                        event.target.value,
                                                    )
                                                }
                                                className="size-9 cursor-pointer rounded border bg-transparent"
                                            />
                                            <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                {selected ?? 'Not set'}
                                            </code>
                                        </div>
                                    </div>
                                    <InputError
                                        message={form.errors.brand_color}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Preview</Label>
                                    <div className="mt-2 rounded-lg border bg-background p-4">
                                        <div
                                            className="h-8 rounded-md font-medium"
                                            style={{
                                                backgroundColor:
                                                    preview?.['--primary'],
                                                color: preview?.[
                                                    '--primary-foreground'
                                                ],
                                            }}
                                        >
                                            <span className="flex h-full items-center px-3 text-sm">
                                                Primary action
                                            </span>
                                        </div>
                                        <div
                                            className="mt-2 h-8 rounded-md"
                                            style={{
                                                backgroundColor:
                                                    preview?.[
                                                        '--sidebar-accent'
                                                    ],
                                                color: preview?.[
                                                    '--sidebar-accent-foreground'
                                                ],
                                            }}
                                        >
                                            <span className="flex h-full items-center px-3 text-sm">
                                                Active sidebar item
                                            </span>
                                        </div>
                                        <div className="mt-2 flex h-8 items-end gap-1 rounded-md bg-muted/50 p-1">
                                            {[70, 45, 90, 30, 60].map(
                                                (height, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex-1 rounded-sm"
                                                        style={{
                                                            height: `${height}%`,
                                                            backgroundColor:
                                                                index === 0
                                                                    ? preview?.[
                                                                          '--brand-primary'
                                                                      ]
                                                                    : 'var(--muted-foreground)',
                                                            opacity:
                                                                index === 0
                                                                    ? 1
                                                                    : 0.4,
                                                        }}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    {form.processing ? 'Saving…' : 'Save'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetToDefault}
                                    disabled={form.processing}
                                >
                                    <Undo2 className="size-4" />
                                    Reset to default
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: '/settings/appearance',
        },
    ],
};
