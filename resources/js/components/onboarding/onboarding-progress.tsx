type Step = 'business' | 'phone' | 'plan';

const steps: Array<{ key: Step; title: string; description: string }> = [
    { key: 'business', title: 'Business profile', description: 'Tell us what you run.' },
    { key: 'phone', title: 'Phone verification', description: 'Protect your free trial.' },
    { key: 'plan', title: 'Choose plan', description: 'Start trial or activate.' },
];

export function OnboardingProgress({ current }: { current: Step }) {
    const currentIndex = steps.findIndex((step) => step.key === current);

    return (
        <aside className="h-fit rounded-md border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-primary">Owner onboarding</p>
            <h1 className="mt-2 text-2xl font-semibold">Set up BizTrack</h1>
            <div className="mt-6 grid gap-4">
                {steps.map((step, index) => (
                    <div key={step.key} className="flex gap-3">
                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${index <= currentIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {index + 1}
                        </div>
                        <div>
                            <p className="font-medium">{step.title}</p>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
