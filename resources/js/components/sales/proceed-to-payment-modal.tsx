import { PaymentMethodSelector } from '@/components/sales/payment-method-selector';
import { PaymentStatusPoller } from '@/components/sales/payment-status-poller';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    method: 'cash' | 'telebirr';
    phone: string;
    processing: boolean;
    total: number;
    cashAmount: string;
    creditAmount: string;
    creditEnabled: boolean;
    availableCredit?: number;
    phoneError?: string;
    splitError?: string;
    onMethodChange: (method: 'cash' | 'telebirr') => void;
    onPhoneChange: (phone: string) => void;
    onCashAmountChange: (amount: string) => void;
    onCreditAmountChange: (amount: string) => void;
    onConfirm: () => void;
};

export function ProceedToPaymentModal({
    open,
    onOpenChange,
    method,
    phone,
    processing,
    total,
    cashAmount,
    creditAmount,
    creditEnabled,
    availableCredit = 0,
    phoneError,
    splitError,
    onMethodChange,
    onPhoneChange,
    onCashAmountChange,
    onCreditAmountChange,
    onConfirm,
}: Props) {
    const cash = Number(cashAmount || 0);
    const credit = Number(creditAmount || 0);
    const remaining = Number((total - cash - credit).toFixed(2));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Proceed to Payment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="rounded-md border bg-muted/40 p-4">
                        <p className="text-sm text-muted-foreground">Amount due</p>
                        <p className="text-2xl font-semibold">{total.toFixed(2)} ETB</p>
                    </div>
                    <div className="grid gap-3 rounded-md border bg-background/70 p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="grid gap-2 text-sm font-medium">
                                Pay now amount
                                <Input value={cashAmount} onChange={(event) => onCashAmountChange(event.target.value)} type="number" min="0" step="0.01" />
                            </label>
                            <label className="grid gap-2 text-sm font-medium">
                                Credit amount
                                <Input value={creditAmount} onChange={(event) => onCreditAmountChange(event.target.value)} type="number" min="0" step="0.01" disabled={!creditEnabled} />
                            </label>
                        </div>
                        {creditEnabled && (
                            <p className="text-xs text-muted-foreground">
                                Available customer credit: {availableCredit.toFixed(2)} ETB
                            </p>
                        )}
                        <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                            <span>Unassigned amount</span>
                            <span className={remaining === 0 ? 'font-medium text-primary' : 'font-medium text-destructive'}>
                                {remaining.toFixed(2)} ETB
                            </span>
                        </div>
                        {splitError && <span className="text-xs text-destructive">{splitError}</span>}
                    </div>
                    <PaymentMethodSelector value={method} onChange={onMethodChange} />
                    {method === 'telebirr' && (
                        <label className="grid gap-2 text-sm font-medium">
                            Customer phone number
                            <Input value={phone} onChange={(event) => onPhoneChange(event.target.value)} placeholder="09..." />
                            {phoneError && <span className="text-xs text-destructive">{phoneError}</span>}
                        </label>
                    )}
                    <PaymentStatusPoller active={method === 'telebirr' && processing} />
                    <Button type="button" onClick={onConfirm} disabled={processing}>
                        {processing ? 'Processing...' : method === 'cash' ? 'Confirm cash payment' : 'Send Telebirr request'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
