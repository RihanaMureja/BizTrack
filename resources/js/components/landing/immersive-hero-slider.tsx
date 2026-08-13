// resources/js/components/landing/immersive-hero-slider.tsx
import { useEffect, useState, useRef, type CSSProperties } from 'react';
import type { LandingHeroSlide } from '../../data/landing-hero-slides';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { register } from '@/routes';

interface ImmersiveHeroSliderProps {
    slides: LandingHeroSlide[];
    intervalMs?: number;
    onSlideChange?: (index: number) => void;
    activeIndex?: number;
    className?: string;
}

export function ImmersiveHeroSlider({
    slides,
    intervalMs = 2000,
    onSlideChange,
    activeIndex: controlledIndex,
    className = '',
}: ImmersiveHeroSliderProps) {
    const [internalIndex, setInternalIndex] = useState(0);
    const autoplayTimerRef = useRef<number | null>(null);
    const activeIndex = controlledIndex ?? internalIndex;
    const prefersReducedMotion = typeof window !== 'undefined' && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleSlideChange = (nextIndex: number, manual = false) => {
        if (nextIndex === activeIndex) return;

        if (controlledIndex === undefined) {
            setInternalIndex(nextIndex);
        }

        onSlideChange?.(nextIndex);

        if (manual && autoplayTimerRef.current) {
            clearInterval(autoplayTimerRef.current);
            startAutoplay();
        }
    };

    const startAutoplay = () => {
        if (autoplayTimerRef.current) {
            clearInterval(autoplayTimerRef.current);
        }
        if (slides.length <= 1 || prefersReducedMotion) return;

        autoplayTimerRef.current = window.setInterval(() => {
            const nextIndex = (activeIndex + 1) % slides.length;
            handleSlideChange(nextIndex);
        }, intervalMs);
    };

    useEffect(() => {
        return () => {
            if (autoplayTimerRef.current) {
                clearInterval(autoplayTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (prefersReducedMotion) {
            return;
        }
        startAutoplay();
        return () => {
            if (autoplayTimerRef.current) {
                clearInterval(autoplayTimerRef.current);
            }
        };
    }, [intervalMs, slides.length, activeIndex, prefersReducedMotion]);

    const getGradientOverlays = (slide: LandingHeroSlide) => {
        const isLeft = slide.textPosition === 'left';
        return isLeft 
            ? 'bg-gradient-to-r from-black/70 via-black/40 to-black/10'
            : 'bg-gradient-to-l from-black/70 via-black/40 to-black/10';
    };

    return (
        <div className={cn('relative w-full h-full overflow-hidden', className)}>
            <style>{`
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                .hero-text-enter {
                    animation: heroTextEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                .hero-text-exit {
                    animation: heroTextExit 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes heroTextEnter {
                    from {
                        opacity: 0;
                        transform: translateX(var(--tx, 0));
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes heroTextExit {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(var(--tx-exit, 0));
                    }
                }
            `}</style>

            {/* Background Images */}
            <div className="absolute inset-0">
                {slides.map((slide, index) => {
                    const isActive = index === activeIndex;

                    return (
                        <div
                            key={`image-${slide.image}-${index}`}
                            className={cn(
                                'absolute inset-0 transition-all duration-500 ease-in-out',
                                isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                            )}
                        >
                            <img
                                src={slide.image}
                                alt={slide.eyebrow}
                                className="h-full w-full object-cover"
                                loading={index <= 1 ? 'eager' : 'lazy'}
                            />

                            {/* Dynamic Gradient Overlay */}
                            <div className={cn('absolute inset-0', getGradientOverlays(slide))} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                    );
                })}
            </div>

            {/* Content - Text positioned LEFT or RIGHT ONLY, never centered */}
            <div className="relative z-10 h-full flex flex-col justify-center">
                {slides.map((slide, index) => {
                    const isActive = index === activeIndex;
                    const isLeft = slide.textPosition === 'left';

                    return (
                        <div
                            key={`content-${slide.image}-${index}`}
                            className={cn(
                                'absolute inset-y-0 flex h-full flex-col justify-center transition-all duration-500 ease-in-out',
                                isActive ? 'pointer-events-auto hero-text-enter' : 'pointer-events-none hero-text-exit',
                                isLeft ? 'left-0' : 'right-0'
                            )}
                            style={{
                                '--tx': isLeft ? '-48px' : '48px',
                                '--tx-exit': isLeft ? '-48px' : '48px',
                            } as CSSProperties}
                        >
                            <div
                                className={cn(
                                    'w-full px-5 sm:px-6 lg:px-8',
                                    isLeft
                                        ? 'max-w-[26rem] sm:max-w-[30rem] lg:max-w-[34rem]'
                                        : 'ml-auto max-w-[26rem] sm:max-w-[30rem] lg:max-w-[34rem]'
                                )}
                            >
                                <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6 lg:p-7">
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="inline-block">
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-300 sm:text-xs">
                                                {slide.eyebrow}
                                            </span>
                                        </div>

                                        <h1
                                            className={cn(
                                                'text-2xl font-semibold leading-tight tracking-tight text-white',
                                                'sm:text-3xl md:text-[2.5rem] xl:text-[2.85rem]'
                                            )}
                                        >
                                            {slide.heading}
                                        </h1>

                                        <p
                                            className={cn(
                                                'max-w-prose text-sm leading-6 text-white/80',
                                                'sm:text-[15px] sm:leading-6 md:text-base'
                                            )}
                                        >
                                            {slide.description}
                                        </p>

                                        <div className="pt-1 sm:pt-2">
                                            <a
                                                href={register().url}
                                                className="group inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all duration-200 hover:bg-teal-400 hover:shadow-teal-400/30 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-transparent"
                                            >
                                                {slide.cta}
                                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Minimal Bottom Controls */}
            <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-between px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Progress Bar & Counter (Left) */}
                <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                        {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                    </span>
                    <div className="h-0.5 bg-white/20 flex-1 min-w-[60px] sm:min-w-[120px] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all"
                            style={{
                                width: `${((activeIndex + 1) / slides.length) * 100}%`,
                                transitionDuration: prefersReducedMotion ? '0ms' : '500ms',
                            }}
                        />
                    </div>
                </div>

                {/* Slide Indicators (Right) */}
                <div className="flex items-center gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={`indicator-${index}`}
                            type="button"
                            aria-label={`Slide ${index + 1}`}
                            aria-current={index === activeIndex ? 'true' : 'false'}
                            onClick={() => handleSlideChange(index, true)}
                            className={cn(
                                'rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-transparent',
                                index === activeIndex
                                    ? 'h-2 w-8 bg-white'
                                    : 'h-2 w-2 bg-white/40 hover:bg-white/60'
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
