import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'business' | 'phone' | 'plan';

const steps: Array<{ key: Step; label: string }> = [
    { key: 'business', label: 'Business Profile' },
    { key: 'phone', label: 'Phone Verification' },
    { key: 'plan', label: 'Choose Plan' },
];

export function OnboardingProgress({ current }: { current: Step }) {
    const currentIndex = steps.findIndex((s) => s.key === current);

    return (
        <div className="flex items-center gap-0 py-1">
            {steps.map((step, index) => {
                const completed = index < currentIndex;
                const active = step.key === current;
                const inactive = !completed && !active;

                return (
                    <div key={step.key} className="flex items-center">
                        {/* Step */}
                        <div className="flex items-center gap-1.5">
                            <div
                                className={cn(
                                    'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                                    active && 'bg-primary text-primary-foreground ring-2 ring-primary/25',
                                    completed && 'bg-primary/15 text-primary',
                                    inactive && 'bg-muted text-muted-foreground',
                                )}
                            >
                                {completed ? <Check className="size-3" /> : index + 1}
                            </div>
                            <span
                                className={cn(
                                    'text-xs font-medium whitespace-nowrap',
                                    active && 'text-primary',
                                    completed && 'text-muted-foreground',
                                    inactive && 'text-muted-foreground/60',
                                )}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'mx-2.5 h-px w-10 shrink-0 transition-colors',
                                    index < currentIndex ? 'bg-primary/30' : 'bg-border',
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
