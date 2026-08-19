import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CheckCircle2, CreditCard, ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import apolloLogo from '../../../../assets/payment option logos/apollo logo.png';
import cbeBirrLogo from '../../../../assets/payment option logos/cbebirr logo.jpg';
import mpesaLogo from '../../../../assets/payment option logos/mpesa logo.png';
import telebirrLogo from '../../../../assets/payment option logos/telebirr logo.png';

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

type PaymentOptionId = 'telebirr' | 'mpesa' | 'cbebirr' | 'apollo';

type PaymentOption = {
    id: PaymentOptionId;
    name: string;
    logo: string;
    helper: string;
    fieldLabel: string;
    fieldType: 'phone' | 'account';
    accent: string;
};

const paymentOptions: PaymentOption[] = [
    {
        id: 'telebirr',
        name: 'Telebirr',
        logo: telebirrLogo,
        helper: 'Mobile wallet payment',
        fieldLabel: 'Telebirr phone number',
        fieldType: 'phone',
        accent: '#00AEEF',
    },
    {
        id: 'mpesa',
        name: 'M-Pesa',
        logo: mpesaLogo,
        helper: 'Pay from Safaricom wallet',
        fieldLabel: 'M-Pesa phone number',
        fieldType: 'phone',
        accent: '#16A34A',
    },
    {
        id: 'cbebirr',
        name: 'CBE Birr',
        logo: cbeBirrLogo,
        helper: 'Bank wallet checkout',
        fieldLabel: 'CBE Birr phone number',
        fieldType: 'phone',
        accent: '#8B1E4D',
    },
    {
        id: 'apollo',
        name: 'Apollo',
        logo: apolloLogo,
        helper: 'Account-based payment',
        fieldLabel: 'Apollo account number',
        fieldType: 'account',
        accent: '#0F766E',
    },
];

export function DemoPlanPaymentModal({ open, plan, context, processing = false, onOpenChange, onConfirm }: Props) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentOptionId>('telebirr');
    const [phoneSuffix, setPhoneSuffix] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const price = Number(plan?.price ?? 0);
    const action = context === 'change-plan' ? 'Confirm plan change' : 'Confirm payment and activate';
    const selectedOption = useMemo(
        () => paymentOptions.find((option) => option.id === selectedMethod) ?? paymentOptions[0],
        [selectedMethod],
    );

    useEffect(() => {
        if (!open) {
            setPhoneSuffix('');
            setAccountNumber('');
            setError(null);
            setSelectedMethod('telebirr');
        }
    }, [open]);

    const paymentReference = plan ? `BT-${context.toUpperCase()}-${plan.id}-${Date.now().toString().slice(-6)}` : '';

    const confirmDemoPayment = () => {
        if (!plan) {
            return;
        }

        const cleanPhone = phoneSuffix.replace(/\D/g, '');
        const cleanAccount = accountNumber.trim();

        if (selectedOption.fieldType === 'phone' && cleanPhone.length < 9) {
            setError('Enter the remaining phone digits after +251.');
            return;
        }

        if (selectedOption.fieldType === 'account' && cleanAccount.length < 6) {
            setError('Enter a valid Apollo account number.');
            return;
        }

        setError(null);
        openDemoGatewayWindow({
            option: selectedOption,
            planName: plan.name,
            amount: `${price.toLocaleString()} ETB`,
            reference: paymentReference,
            customerReference: selectedOption.fieldType === 'phone' ? `+251${cleanPhone}` : cleanAccount,
        });

        window.setTimeout(() => {
            onConfirm();
        }, 1800);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{context === 'change-plan' ? 'Demo payment for plan change' : 'Demo payment before activation'}</DialogTitle>
                </DialogHeader>

                {plan && (
                    <div className="grid gap-5">
                        <div className="rounded-2xl border bg-muted/30 p-4">
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

                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                            <div className="flex gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                    <CreditCard className="size-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Choose a demo payment provider</p>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        This simulates a real subscription checkout. The same handoff point can later be replaced by Telebirr, CBE Birr, M-Pesa, or Apollo gateway APIs.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {paymentOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedMethod(option.id);
                                        setError(null);
                                    }}
                                    className={cn(
                                        'group rounded-2xl border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg',
                                        selectedMethod === option.id ? 'border-primary ring-2 ring-primary/15' : 'border-border hover:border-primary/40',
                                    )}
                                >
                                    <span className="flex h-14 items-center justify-center rounded-xl bg-white p-2 shadow-inner ring-1 ring-black/5 dark:bg-white">
                                        <img src={option.logo} alt={`${option.name} logo`} className="max-h-10 max-w-full object-contain transition-transform group-hover:scale-105" />
                                    </span>
                                    <span className="mt-3 flex items-center justify-between gap-2">
                                        <span>
                                            <span className="block text-sm font-semibold">{option.name}</span>
                                            <span className="mt-0.5 block text-xs text-muted-foreground">{option.helper}</span>
                                        </span>
                                        {selectedMethod === option.id && <CheckCircle2 className="size-5 shrink-0 text-primary" />}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="rounded-2xl border bg-background p-4">
                            <label className="grid gap-2 text-sm font-medium">
                                {selectedOption.fieldLabel}
                                {selectedOption.fieldType === 'phone' ? (
                                    <div className="flex overflow-hidden rounded-xl border bg-card shadow-xs focus-within:ring-2 focus-within:ring-primary/20">
                                        <span className="inline-flex items-center border-r bg-muted/50 px-3 text-sm font-semibold text-muted-foreground">
                                            +251
                                        </span>
                                        <input
                                            value={phoneSuffix}
                                            onChange={(event) => setPhoneSuffix(event.target.value.replace(/\D/g, '').slice(0, 9))}
                                            placeholder="912345678"
                                            inputMode="numeric"
                                            className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                                        />
                                    </div>
                                ) : (
                                    <input
                                        value={accountNumber}
                                        onChange={(event) => setAccountNumber(event.target.value)}
                                        placeholder="Enter Apollo account number"
                                        className="h-11 rounded-xl border bg-card px-3 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                )}
                            </label>
                            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                            <ShieldCheck className="size-4 text-primary" />
                            Your business plan changes only after this explicit confirmation.
                        </div>

                        <Button type="button" onClick={confirmDemoPayment} disabled={processing} className="h-11 rounded-full">
                            {processing ? 'Confirming...' : `${action} with ${selectedOption.name}`}
                            {!processing && <Smartphone className="size-4" />}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function openDemoGatewayWindow({
    option,
    planName,
    amount,
    reference,
    customerReference,
}: {
    option: PaymentOption;
    planName: string;
    amount: string;
    reference: string;
    customerReference: string;
}) {
    const popup = window.open('', '_blank', 'width=520,height=680');

    if (!popup) {
        return;
    }

    popup.opener = null;
    popup.document.write(demoGatewayHtml({ option, planName, amount, reference, customerReference }));
    popup.document.close();
}

function demoGatewayHtml({
    option,
    planName,
    amount,
    reference,
    customerReference,
}: {
    option: PaymentOption;
    planName: string;
    amount: string;
    reference: string;
    customerReference: string;
}) {
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(option.name)} Demo Payment</title>
    <style>
        * { box-sizing: border-box; }
        body {
            min-height: 100vh;
            margin: 0;
            display: grid;
            place-items: center;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #0f172a;
            background:
                radial-gradient(circle at 15% 10%, ${option.accent}28, transparent 28rem),
                radial-gradient(circle at 90% 0%, #10b98122, transparent 24rem),
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
        .logo {
            display: inline-flex;
            width: 132px;
            height: 74px;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            background: #fff;
            padding: 12px;
            box-shadow: inset 0 0 0 1px #e5efe9, 0 14px 34px -28px rgba(15, 23, 42, 0.6);
        }
        .logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
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
        .row { display: flex; justify-content: space-between; gap: 16px; font-size: 13px; }
        .row span:first-child { color: #647568; }
        .row span:last-child { font-weight: 700; color: #10231a; text-align: right; }
        .loader {
            margin: 26px auto 8px;
            width: 48px;
            height: 48px;
            border: 4px solid #dceadf;
            border-top-color: ${option.accent};
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
        <div class="logo"><img src="${option.logo}" alt="${escapeHtml(option.name)} logo" /></div>
        <h1>${escapeHtml(option.name)} Demo Checkout</h1>
        <p>Processing your BizTrack subscription payment securely.</p>
        <div class="summary">
            <div class="row"><span>Plan</span><span>${escapeHtml(planName)}</span></div>
            <div class="row"><span>Amount</span><span>${escapeHtml(amount)}</span></div>
            <div class="row"><span>Paying with</span><span>${escapeHtml(customerReference)}</span></div>
            <div class="row"><span>Reference</span><span>${escapeHtml(reference)}</span></div>
        </div>
        <div class="loader" aria-label="Processing payment"></div>
        <div class="success" aria-hidden="true">✓</div>
        <p class="status" id="status">Waiting for ${escapeHtml(option.name)} confirmation...</p>
    </main>
    <script>
        setTimeout(() => {
            document.getElementById('card').classList.add('done');
            document.getElementById('status').textContent = 'Payment successfully done through ${escapeJs(option.name)}.';
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

function escapeJs(value: string) {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
