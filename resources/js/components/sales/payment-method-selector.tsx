import { CreditCard, Smartphone } from 'lucide-react';

type Props = {
    value: 'cash' | 'telebirr';
    onChange: (value: 'cash' | 'telebirr') => void;
};

export function PaymentMethodSelector({ value, onChange }: Props) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <button
                type="button"
                onClick={() => onChange('cash')}
                className={`rounded-md border p-4 text-left transition ${value === 'cash' ? 'border-primary bg-primary/10' : 'bg-background hover:bg-accent'}`}
            >
                <CreditCard className="size-5 text-primary" />
                <p className="mt-2 font-medium">Cash</p>
                <p className="text-sm text-muted-foreground">Confirm payment immediately.</p>
            </button>
            <button
                type="button"
                onClick={() => onChange('telebirr')}
                className={`rounded-md border p-4 text-left transition ${value === 'telebirr' ? 'border-primary bg-primary/10' : 'bg-background hover:bg-accent'}`}
            >
                <Smartphone className="size-5 text-primary" />
                <p className="mt-2 font-medium">Mobile money</p>
                <p className="text-sm text-muted-foreground">Send Telebirr request-to-pay.</p>
            </button>
        </div>
    );
}
