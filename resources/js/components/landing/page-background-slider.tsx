import { useEffect, useState } from 'react';
import type { LandingHeroSlide } from '@/data/landing-hero-slides';

type Props = {
    slides: LandingHeroSlide[];
    intervalMs?: number;
    onSlideChange?: (index: number) => void;
};

export function PageBackgroundSlider({ slides, intervalMs = 5000, onSlideChange }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        onSlideChange?.(activeIndex);
    }, [activeIndex, onSlideChange]);

    useEffect(() => {
        if (slides.length <= 1) {
            return;
        }

        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % slides.length);
        }, intervalMs);

        return () => window.clearInterval(timer);
    }, [intervalMs, slides.length]);

    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-slate-950" aria-hidden="true">
            {slides.map((slide, index) => {
                const offset = index - activeIndex;
                const loopOffset = offset < -1 ? slides.length + offset : offset;

                return (
                    <img
                        key={slide.image}
                        src={slide.image}
                        alt=""
                        className="landing-page-background-slide absolute inset-0 h-full w-full object-cover"
                        style={{
                            opacity: index === activeIndex ? 1 : 0,
                            transform: `translateX(${loopOffset * 100}%) scale(1.06)`,
                        }}
                    />
                );
            })}
            <div className="absolute inset-0 bg-white/22 backdrop-blur-[0.5px] dark:bg-slate-950/42" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/58 to-background/14" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-background/12" />
        </div>
    );
}
