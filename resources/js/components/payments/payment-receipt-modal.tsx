import { PaymentReceiptPreview, type PaymentReceipt } from '@/components/payments/payment-receipt-preview';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import axios from 'axios';
import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    paymentId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function PaymentReceiptModal({ paymentId, open, onOpenChange }: Props) {
    const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !paymentId) return;

        setLoading(true);
        axios
            .get<PaymentReceipt>(`/payments/${paymentId}/receipt`)
            .then((response) => setReceipt(response.data))
            .finally(() => setLoading(false));
    }, [open, paymentId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader className="print:hidden">
                    <div className="flex items-center justify-between gap-3">
                        <DialogTitle>Receipt preview</DialogTitle>
                        <Button type="button" variant="outline" onClick={() => window.print()} disabled={!receipt}>
                            <Printer className="size-4" />
                            Print
                        </Button>
                    </div>
                </DialogHeader>
                {loading && (
                    <div className="flex min-h-72 items-center justify-center">
                        <Spinner />
                    </div>
                )}
                {!loading && receipt && <PaymentReceiptPreview receipt={receipt} />}
            </DialogContent>
        </Dialog>
    );
}
