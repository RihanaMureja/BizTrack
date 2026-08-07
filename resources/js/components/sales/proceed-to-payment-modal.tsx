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
    phoneError?: string;
    onMethodChange: (method: 'cash' | 'telebirr') => void;
    onPhoneChange: (phone: string) => void;
    onConfirm: () => void;
};

export function ProceedToPaymentModal({
    open,
    onOpenChange,
    method,
    phone,
    processing,
    total,
    phoneError,
    onMethodChange,
    onPhoneChange,
    onConfirm,
}: Props) {
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
