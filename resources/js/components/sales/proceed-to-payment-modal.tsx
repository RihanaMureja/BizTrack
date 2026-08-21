import { PaymentMethodSelector } from '@/components/sales/payment-method-selector';
import { PaymentStatusPoller } from '@/components/sales/payment-status-poller';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import * as React from 'react';

type PaymentMethodEntry = {
    id: string;
    method: 'cash' | 'telebirr';
    amount: string;
    phone?: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    processing: boolean;
    total: number;
    creditAmount: string;
    creditEnabled: boolean;
    availableCredit?: number;
    onCreditAmountChange: (amount: string) => void;
    onConfirm: (methods: PaymentMethodEntry[]) => void;
};

export function ProceedToPaymentModal({
    open,
    onOpenChange,
    processing,
    total,
    creditAmount,
    creditEnabled,
    availableCredit = 0,
    onCreditAmountChange,
    onConfirm,
}: Props) {
    const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethodEntry[]>([
        { id: crypto.randomUUID(), method: 'cash', amount: '' }
    ]);

    // Auto-fill amounts when modal opens
    React.useEffect(() => {
        if (open && paymentMethods.length === 1 && !paymentMethods[0].amount) {
            // Calculate credit amount (use all available credit up to total)
            const creditToUse = creditEnabled ? Math.min(availableCredit, total) : 0;
            
            // Round to 2 decimal places to avoid precision issues
            const roundedCredit = Math.round(creditToUse * 100) / 100;
            
            // Set credit amount
            if (creditEnabled && roundedCredit > 0) {
                onCreditAmountChange(roundedCredit.toFixed(2));
            } else if (creditEnabled) {
                onCreditAmountChange('0');
            }
            
            // Calculate remaining amount for cash payment
            const remainingAmount = Math.round((total - roundedCredit) * 100) / 100;
            
            // Auto-fill first payment method with remaining amount
            if (remainingAmount > 0) {
                setPaymentMethods([{
                    id: paymentMethods[0].id,
                    method: 'cash',
                    amount: remainingAmount.toFixed(2)
                }]);
            } else {
                setPaymentMethods([{
                    id: paymentMethods[0].id,
                    method: 'cash',
                    amount: ''
                }]);
            }
        }
        
        // Reset when modal closes
        if (!open) {
            setPaymentMethods([{ id: crypto.randomUUID(), method: 'cash', amount: '' }]);
        }
    }, [open, total, creditEnabled, availableCredit]);

    const credit = Number(creditAmount || 0);
    const paymentTotal = paymentMethods.reduce((sum, pm) => sum + Number(pm.amount || 0), 0);
    const totalAllocated = paymentTotal + credit;
    const remaining = Number((total - totalAllocated).toFixed(2));

    const addPaymentMethod = () => {
        setPaymentMethods([...paymentMethods, { id: crypto.randomUUID(), method: 'cash', amount: '' }]);
    };

    const removePaymentMethod = (id: string) => {
        if (paymentMethods.length > 1) {
            setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
        }
    };

    const updatePaymentMethod = (id: string, field: keyof PaymentMethodEntry, value: any) => {
        setPaymentMethods(paymentMethods.map(pm => 
            pm.id === id ? { ...pm, [field]: value } : pm
        ));
    };

    const handleConfirm = () => {
        console.log('handleConfirm called');
        console.log('remaining:', remaining);
        console.log('paymentMethods:', paymentMethods);
        console.log('credit:', credit);
        
        if (remaining !== 0) {
            console.log('Blocked: remaining is not 0');
            return;
        }
        const validMethods = paymentMethods.filter(pm => Number(pm.amount || 0) > 0);
        console.log('validMethods:', validMethods);
        
        if (validMethods.length === 0 && credit === 0) {
            console.log('Blocked: no valid methods and no credit');
            return;
        }
        console.log('Calling onConfirm with validMethods');
        onConfirm(validMethods);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Proceed to Payment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="rounded-md border bg-muted/40 p-4">
                        <p className="text-sm text-muted-foreground">Amount due</p>
                        <p className="text-2xl font-semibold">{total.toFixed(2)} ETB</p>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">Payment Methods</p>
                            <Button type="button" variant="outline" size="sm" onClick={addPaymentMethod}>
                                <Plus className="size-4" />
                                Add Method
                            </Button>
                        </div>
                        {paymentMethods.map((pm, index) => (
                            <div key={pm.id} className="grid gap-3 rounded-md border bg-background/70 p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Payment {index + 1}</span>
                                    {paymentMethods.length > 1 && (
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => removePaymentMethod(pm.id)}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <label className="grid gap-2 text-sm">
                                        Payment Method
                                        <select
                                            value={pm.method}
                                            onChange={(e) => updatePaymentMethod(pm.id, 'method', e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="telebirr">Mobile money</option>
                                        </select>
                                    </label>
                                    <label className="grid gap-2 text-sm">
                                        Amount
                                        <Input 
                                            value={pm.amount} 
                                            onChange={(e) => updatePaymentMethod(pm.id, 'amount', e.target.value)} 
                                            type="number" 
                                            min="0" 
                                            step="0.01" 
                                            placeholder="0.00"
                                        />
                                    </label>
                                </div>
                                {pm.method === 'telebirr' && (
                                    <label className="grid gap-2 text-sm">
                                        Customer phone number
                                        <Input 
                                            value={pm.phone || ''} 
                                            onChange={(e) => updatePaymentMethod(pm.id, 'phone', e.target.value)} 
                                            placeholder="09..." 
                                        />
                                    </label>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Credit Payment */}
                    {creditEnabled && (
                        <div className="grid gap-3 rounded-md border bg-background/70 p-3">
                            <p className="text-sm font-semibold">Customer Credit</p>
                            <label className="grid gap-2 text-sm">
                                Credit amount
                                <Input 
                                    value={creditAmount} 
                                    onChange={(e) => onCreditAmountChange(e.target.value)} 
                                    type="number" 
                                    min="0" 
                                    step="0.01" 
                                />
                            </label>
                            <p className="text-xs text-muted-foreground">
                                Available customer credit: {availableCredit.toFixed(2)} ETB
                            </p>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="rounded-md border bg-muted/50 p-3 text-sm">
                        <div className="flex justify-between">
                            <span>Payment methods total</span>
                            <span className="font-medium">{paymentTotal.toFixed(2)} ETB</span>
                        </div>
                        {creditEnabled && (
                            <div className="flex justify-between mt-1">
                                <span>Credit amount</span>
                                <span className="font-medium">{credit.toFixed(2)} ETB</span>
                            </div>
                        )}
                        <div className="flex justify-between mt-2 pt-2 border-t">
                            <span className="font-semibold">Unassigned amount</span>
                            <span className={remaining === 0 ? 'font-semibold text-primary' : 'font-semibold text-destructive'}>
                                {remaining.toFixed(2)} ETB
                            </span>
                        </div>
                    </div>

                    {remaining !== 0 && (
                        <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            Please allocate the full amount across payment methods. Remaining: {remaining.toFixed(2)} ETB
                        </div>
                    )}

                    <Button type="button" onClick={handleConfirm} disabled={processing || remaining !== 0}>
                        {processing ? 'Processing...' : 'Confirm payment'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
