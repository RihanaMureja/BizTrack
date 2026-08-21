import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Banknote, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import apolloLogo from '../../../../assets/payment option logos/apollo logo.png';
import cbeBirrLogo from '../../../../assets/payment option logos/cbebirr logo.jpg';
import mpesaLogo from '../../../../assets/payment option logos/mpesa logo.png';
import telebirrLogo from '../../../../assets/payment option logos/telebirr logo.png';

export type SalePaymentMethod = 'cash' | 'telebirr' | 'mpesa' | 'cbebirr' | 'apollo' | 'credit';

export type SalePaymentLine = {
    method: SalePaymentMethod;
    amount: number;
    phone?: string | null;
    account_number?: string | null;
    reference?: string | null;
};

type PaymentOption = {
    id: SalePaymentMethod;
    name: string;
    helper: string;
    fieldType?: 'phone' | 'account';
    logo?: string;
    accent: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    processing: boolean;
    total: number;
    creditEnabled: boolean;
    availableCredit?: number;
    splitError?: string;
    onConfirm: (lines: SalePaymentLine[]) => void;
};

const paymentOptions: PaymentOption[] = [
    { id: 'cash', name: 'Cash', helper: 'Money received at counter', accent: '#047857' },
    { id: 'telebirr', name: 'Telebirr', helper: 'Mobile wallet payment', fieldType: 'phone', logo: telebirrLogo, accent: '#00AEEF' },
    { id: 'mpesa', name: 'M-Pesa', helper: 'Safaricom wallet payment', fieldType: 'phone', logo: mpesaLogo, accent: '#16A34A' },
    { id: 'cbebirr', name: 'CBE Birr', helper: 'Bank wallet checkout', fieldType: 'phone', logo: cbeBirrLogo, accent: '#8B1E4D' },
    { id: 'apollo', name: 'Apollo', helper: 'Account-based payment', fieldType: 'account', logo: apolloLogo, accent: '#0F766E' },
    { id: 'credit', name: 'Customer credit', helper: 'Add to customer balance', accent: '#0F172A' },
];

export function ProceedToPaymentModal({
    open,
    onOpenChange,
    processing,
    total,
    creditEnabled,
    availableCredit = 0,
    splitError,
    onConfirm,
}: Props) {
    const [amounts, setAmounts] = useState<Record<SalePaymentMethod, string>>({
        cash: '0',
        telebirr: '0',
        mpesa: '0',
        cbebirr: '0',
        apollo: '0',
        credit: '0',
    });
    const [phoneSuffixes, setPhoneSuffixes] = useState<Record<string, string>>({});
    const [accountNumbers, setAccountNumbers] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const creditAmount = creditEnabled ? Math.min(total, availableCredit) : 0;

        setAmounts({
            cash: Math.max(0, total - creditAmount).toFixed(2),
            telebirr: '0',
            mpesa: '0',
            cbebirr: '0',
            apollo: '0',
            credit: creditAmount.toFixed(2),
        });
        setPhoneSuffixes({});
        setAccountNumbers({});
        setError(null);
    }, [availableCredit, creditEnabled, open, total]);

    const assigned = useMemo(
        () => Number(paymentOptions.reduce((sum, option) => sum + Number(amounts[option.id] || 0), 0).toFixed(2)),
        [amounts],
    );
    const remaining = Number((total - assigned).toFixed(2));
    const activeLines = paymentOptions.filter((option) => Number(amounts[option.id] || 0) > 0);

    const updateAmount = (method: SalePaymentMethod, value: string) => {
        setAmounts((current) => ({
            ...current,
            [method]: value,
        }));
        setError(null);
    };

    const confirm = () => {
        const lines: SalePaymentLine[] = [];

        if (remaining !== 0) {
            setError('Payment amounts must equal the sale total.');
            return;
        }

        if (Number(amounts.credit || 0) > availableCredit) {
            setError('Credit amount exceeds this customer available credit.');
            return;
        }

        for (const option of paymentOptions) {
            const amount = Number(amounts[option.id] || 0);

            if (amount <= 0) {
                continue;
            }

            if (option.id === 'credit' && !creditEnabled) {
                setError('Enable credit sale before assigning an amount to customer credit.');
                return;
            }

            if (option.fieldType === 'phone') {
                const suffix = (phoneSuffixes[option.id] ?? '').replace(/\D/g, '');

                if (suffix.length < 9) {
                    setError(`Enter the remaining phone digits for ${option.name}.`);
                    return;
                }

                lines.push({
                    method: option.id,
                    amount,
                    phone: `+251${suffix}`,
                    reference: `POS-${option.id.toUpperCase()}-${Date.now().toString().slice(-6)}`,
                });
                continue;
            }

            if (option.fieldType === 'account') {
                const accountNumber = (accountNumbers[option.id] ?? '').trim();

                if (accountNumber.length < 6) {
                    setError(`Enter a valid ${option.name} account number.`);
                    return;
                }

                lines.push({
                    method: option.id,
                    amount,
                    account_number: accountNumber,
                    reference: `POS-${option.id.toUpperCase()}-${Date.now().toString().slice(-6)}`,
                });
                continue;
            }

            lines.push({
                method: option.id,
                amount,
                reference: option.id === 'cash' ? `POS-CASH-${Date.now().toString().slice(-6)}` : null,
            });
        }

        const gatewayLines = lines.filter((line) => !['cash', 'credit'].includes(line.method));

        if (gatewayLines.length > 0) {
            openPosDemoGatewayWindow(gatewayLines);
        }

        onConfirm(lines);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] w-[min(96vw,72rem)] max-w-none overflow-y-auto p-5 sm:p-6">
                <DialogHeader>
                    <DialogTitle>Proceed to Payment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3 rounded-2xl border bg-muted/30 p-3 sm:grid-cols-[1fr_auto] sm:p-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Amount due</p>
                            <p className="text-2xl font-semibold">{total.toFixed(2)} ETB</p>
                        </div>
                        <div className="rounded-xl bg-background px-4 py-2 text-right">
                            <p className="text-xs uppercase text-muted-foreground">Unassigned</p>
                            <p className={cn('text-lg font-semibold', remaining === 0 ? 'text-primary' : 'text-destructive')}>
                                {remaining.toFixed(2)} ETB
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {paymentOptions
                            .filter((option) => option.id !== 'credit' || creditEnabled)
                            .map((option) => {
                                const amount = Number(amounts[option.id] || 0);
                                const isActive = amount > 0;

                                return (
                                    <div
                                        key={option.id}
                                        className={cn(
                                            'rounded-2xl border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                                            isActive ? 'border-primary ring-2 ring-primary/10' : 'border-border',
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-inner ring-1 ring-black/5 dark:bg-white">
                                                    {option.logo ? (
                                                        <img src={option.logo} alt={`${option.name} logo`} className="max-h-7 max-w-full object-contain" />
                                                    ) : option.id === 'cash' ? (
                                                        <Banknote className="size-5 text-primary" />
                                                    ) : (
                                                        <CreditCard className="size-5 text-primary" />
                                                    )}
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-semibold">{option.name}</span>
                                                    <span className="block truncate text-xs text-muted-foreground">{option.helper}</span>
                                                </span>
                                            </div>
                                            {isActive && <CheckCircle2 className="size-5 shrink-0 text-primary" />}
                                        </div>
                                        <label className="mt-2 grid gap-1 text-xs font-medium text-muted-foreground">
                                            Amount
                                            <Input
                                                value={amounts[option.id]}
                                                onChange={(event) => updateAmount(option.id, event.target.value)}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="h-9 text-sm"
                                            />
                                        </label>
                                        {option.fieldType === 'phone' && amount > 0 && (
                                            <label className="mt-2 grid gap-1 text-xs font-medium text-muted-foreground">
                                                Phone number
                                                <div className="flex overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-primary/20">
                                                    <span className="inline-flex items-center border-r bg-muted/50 px-2 text-xs font-semibold">+251</span>
                                                    <input
                                                        value={phoneSuffixes[option.id] ?? ''}
                                                        onChange={(event) =>
                                                            setPhoneSuffixes((current) => ({
                                                                ...current,
                                                                [option.id]: event.target.value.replace(/\D/g, '').slice(0, 9),
                                                            }))
                                                        }
                                                        placeholder="912345678"
                                                        inputMode="numeric"
                                                        className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
                                                    />
                                                </div>
                                            </label>
                                        )}
                                        {option.fieldType === 'account' && amount > 0 && (
                                            <label className="mt-2 grid gap-1 text-xs font-medium text-muted-foreground">
                                                Account number
                                                <Input
                                                    value={accountNumbers[option.id] ?? ''}
                                                    onChange={(event) =>
                                                        setAccountNumbers((current) => ({
                                                            ...current,
                                                            [option.id]: event.target.value,
                                                        }))
                                                    }
                                                    placeholder="Apollo account number"
                                                    className="h-9 text-sm"
                                                />
                                            </label>
                                        )}
                                    </div>
                                );
                            })}
                    </div>

                    {creditEnabled && (
                        <div className="rounded-xl border bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                            Available customer credit: <span className="font-semibold text-foreground">{availableCredit.toFixed(2)} ETB</span>
                        </div>
                    )}

                    <div className="rounded-2xl border bg-background p-3 sm:p-4">
                        <p className="text-sm font-medium">Payment summary</p>
                        <div className="mt-3 grid gap-2 text-sm">
                            {activeLines.length === 0 && <p className="text-muted-foreground">Assign the sale total across one or more payment methods.</p>}
                            {activeLines.map((option) => (
                                <div key={option.id} className="flex justify-between gap-4">
                                    <span>{option.name}</span>
                                    <span className="font-semibold">{Number(amounts[option.id] || 0).toFixed(2)} ETB</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {(error || splitError) && <p className="text-sm text-destructive">{error ?? splitError}</p>}

                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
                        <ShieldCheck className="size-4 text-primary" />
                        Wallet and account payments use a demo confirmation screen now, and can be swapped for real gateway APIs later.
                    </div>

                    <Button type="button" onClick={confirm} disabled={processing || total <= 0} className="h-11 rounded-full">
                        {processing ? 'Creating sale...' : 'Create sale and receipt'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function openPosDemoGatewayWindow(lines: SalePaymentLine[]) {
    const popup = window.open('', '_blank', 'width=540,height=720');

    if (!popup) {
        return;
    }

    popup.opener = null;
    popup.document.write(posGatewayHtml(lines));
    popup.document.close();
}

function posGatewayHtml(lines: SalePaymentLine[]) {
    const rows = lines
        .map((line) => {
            const option = paymentOptions.find((item) => item.id === line.method);

            return `<div class="row">
                <span>${escapeHtml(option?.name ?? line.method)}</span>
                <strong>${Number(line.amount).toFixed(2)} ETB</strong>
            </div>`;
        })
        .join('');
    const providerNames = lines
        .map((line) => paymentOptions.find((item) => item.id === line.method)?.name ?? line.method)
        .join(', ');

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BizTrack POS Demo Payment</title>
    <style>
        * { box-sizing: border-box; }
        body {
            min-height: 100vh;
            margin: 0;
            display: grid;
            place-items: center;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #10231a;
            background:
                radial-gradient(circle at 12% 10%, #00aeef22, transparent 24rem),
                radial-gradient(circle at 90% 0%, #05966924, transparent 26rem),
                linear-gradient(145deg, #f8fffb, #edf7f1);
        }
        .card {
            width: min(92vw, 430px);
            border: 1px solid #dceadf;
            border-radius: 28px;
            background: rgba(255, 255, 255, 0.94);
            padding: 30px;
            box-shadow: 0 30px 90px -46px rgba(0, 44, 26, 0.55);
            text-align: center;
        }
        .mark {
            display: inline-grid;
            width: 72px;
            height: 72px;
            place-items: center;
            border-radius: 22px;
            background: #ecfdf5;
            color: #047857;
            font-size: 34px;
            box-shadow: inset 0 0 0 1px #bbf7d0;
        }
        h1 { margin: 22px 0 8px; font-size: 24px; letter-spacing: -0.02em; }
        p { margin: 0; color: #647568; line-height: 1.6; }
        .summary {
            margin-top: 22px;
            display: grid;
            gap: 10px;
            border-radius: 18px;
            background: #f6faf7;
            padding: 16px;
            text-align: left;
        }
        .row { display: flex; justify-content: space-between; gap: 16px; font-size: 14px; }
        .loader {
            margin: 26px auto 8px;
            width: 48px;
            height: 48px;
            border: 4px solid #dceadf;
            border-top-color: #047857;
            border-radius: 999px;
            animation: spin 850ms linear infinite;
        }
        .success {
            display: none;
            margin: 26px auto 8px;
            width: 58px;
            height: 58px;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: #059669;
            color: white;
            font-size: 34px;
            box-shadow: 0 16px 36px -22px #047857;
        }
        .status { margin-top: 12px; font-weight: 700; color: #334155; }
        .done .loader { display: none; }
        .done .success { display: inline-flex; }
        .done .status { color: #047857; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <main class="card" id="card">
        <div class="mark">BT</div>
        <h1>BizTrack POS Checkout</h1>
        <p>Processing confirmed demo payment through ${escapeHtml(providerNames)}.</p>
        <div class="summary">${rows}</div>
        <div class="loader" aria-label="Processing payment"></div>
        <div class="success" aria-hidden="true">✓</div>
        <p class="status" id="status">Waiting for provider confirmation...</p>
    </main>
    <script>
        setTimeout(() => {
            document.getElementById('card').classList.add('done');
            document.getElementById('status').textContent = 'Payment successfully confirmed.';
        }, 1450);
    </script>
</body>
</html>`;
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
