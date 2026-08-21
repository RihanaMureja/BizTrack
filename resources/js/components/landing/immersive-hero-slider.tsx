// resources/js/components/landing/immersive-hero-slider.tsx
import { useEffect, useState, useRef  } from 'react';
import type {CSSProperties} from 'react';
import { cn } from '@/lib/utils';
import type { LandingHeroSlide } from '../../data/landing-hero-slides';

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
        if (nextIndex === activeIndex) {
return;
}

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

        if (slides.length <= 1 || prefersReducedMotion) {
return;
}

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
        if (typeof window === 'undefined') {
return;
}

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

                .hero-text-enter .hero-copy-item {
                    animation: heroCopyEnter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                .hero-text-enter .hero-copy-item:nth-child(2) { animation-delay: 90ms; }
                .hero-text-enter .hero-copy-item:nth-child(3) { animation-delay: 170ms; }

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

                @keyframes heroCopyEnter {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
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
                                className="landing-hero-image h-full w-full object-cover"
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
                                <div className="space-y-3 text-shadow-sm sm:space-y-4">
                                        <div className="hero-copy-item inline-block">
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-300 sm:text-xs">
                                                {slide.eyebrow}
                                            </span>
                                        </div>

                                        <h2
                                            className={cn(
                                                'hero-copy-item text-xl font-semibold leading-tight tracking-tight text-white',
                                                'sm:text-2xl md:text-3xl xl:text-[2rem]'
                                            )}
                                        >
                                            {slide.heading}
                                        </h2>

                                        <p
                                            className={cn(
                                                'hero-copy-item max-w-prose text-xs leading-5 text-white/80',
                                                'sm:text-sm sm:leading-6'
                                            )}
                                        >
                                            {slide.description}
                                        </p>

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
