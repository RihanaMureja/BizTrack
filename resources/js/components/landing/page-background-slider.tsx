import { useEffect, useState, useCallback } from 'react';
import type { LandingHeroSlide } from '@/data/landing-hero-slides';
import { cn } from '@/lib/utils';

type Props = {
    slides: LandingHeroSlide[];
    /** Auto-advance interval in ms. Default 4500ms. */
    intervalMs?: number;
    /** Called whenever the active index changes. */
    onSlideChange?: (index: number) => void;
    /** Optionally control the active index from outside. */
    activeIndex?: number;
    className?: string;
};

/**
 * A self-contained image slideshow panel.
 *
 * Renders as a relative-positioned block that fills its parent container.
 * Each slide fades + gently scales in, with a subtle gradient overlay that
 * keeps the image visible while ensuring text placed on top remains readable.
 *
 * Previously used `fixed inset-0` (full-page background).  Now uses
 * `relative`/`absolute` so it can live inside the hero panel column.
 */
export function PageBackgroundSlider({
    slides,
    intervalMs = 4500,
    onSlideChange,
    activeIndex: controlledIndex,
    className,
}: Props) {
    const [internalIndex, setInternalIndex] = useState(0);
    const activeIndex = controlledIndex ?? internalIndex;

    // Notify parent whenever active index changes
    useEffect(() => {
        onSlideChange?.(activeIndex);
    }, [activeIndex, onSlideChange]);

    // Auto-advance — respects prefers-reduced-motion
    const advance = useCallback(() => {
        setInternalIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        if (slides.length <= 1 || typeof window === 'undefined') {
return;
}

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
return;
}

        const timer = window.setInterval(advance, intervalMs);

        return () => window.clearInterval(timer);
    }, [advance, intervalMs, slides.length]);

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl bg-[oklch(0.18_0.06_153)]',
                className,
            )}
        >
            {/* Slide images — stacked, only the active one is visible */}
            {slides.map((slide, index) => {
                const isActive = index === activeIndex;

                return (
                    <img
                        key={slide.image}
                        src={slide.image}
                        alt={slide.eyebrow}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className={cn(
                            'absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out will-change-[opacity,transform]',
                            isActive
                                ? 'opacity-100 scale-[1.03]'
                                : 'opacity-0 scale-100',
                        )}
                    />
                );
            })}

            {/* Subtle gradient overlay — keeps image visible, aids text legibility */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none"
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none"
            />

            {/* Slide indicator dots */}
            <div
                aria-label="Slide indicators"
                className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2"
            >
                {slides.map((slide, index) => (
                    <button
                        key={slide.image}
                        aria-label={`Go to slide ${index + 1}: ${slide.heading}`}
                        aria-current={index === activeIndex ? 'true' : undefined}
                        onClick={() => setInternalIndex(index)}
                        className={cn(
                            'h-1.5 rounded-full transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                            index === activeIndex
                                ? 'w-6 bg-white'
                                : 'w-1.5 bg-white/40 hover:bg-white/60',
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
