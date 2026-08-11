import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, ShieldCheck } from 'lucide-react';

export type DemoPlanPaymentContext = 'onboarding' | 'change-plan';

export type DemoPaymentPlan = {
    id: number;
    name: string;
    price: string | number;
    duration_months: number;
    max_cashiers: number;
    description?: string | null;
};

type Props = {
    open: boolean;
    plan: DemoPaymentPlan | null;
    context: DemoPlanPaymentContext;
    processing?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function DemoPlanPaymentModal({ open, plan, context, processing = false, onOpenChange, onConfirm }: Props) {
    const price = Number(plan?.price ?? 0);
    const action = context === 'change-plan' ? 'Confirm plan change' : 'Confirm payment and activate';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{context === 'change-plan' ? 'Demo payment for plan change' : 'Demo payment before activation'}</DialogTitle>
                </DialogHeader>

                {plan && (
                    <div className="grid gap-4">
                        <div className="rounded-md border bg-muted/35 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Selected plan</p>
                                    <h3 className="mt-1 text-xl font-semibold">{plan.name}</h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {plan.description ?? 'Business access plan for BizTrack operations.'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-semibold">{price.toLocaleString()} ETB</p>
                                    <p className="text-xs text-muted-foreground">{plan.duration_months} month billing</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border border-primary/25 bg-primary/5 p-4">
                            <div className="flex gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <CreditCard className="size-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Demo payment step</p>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        This confirmation simulates a successful subscription payment. The handler is isolated so a real payment gateway can replace it later.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                            <ShieldCheck className="size-4 text-primary" />
                            Your business plan changes only after this explicit confirmation.
                        </div>

                        <Button type="button" onClick={onConfirm} disabled={processing}>
                            {processing ? 'Confirming...' : action}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
