import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export type CreditProfile = {
    id: number;
    suggested_credit_limit: string;
    owner_credit_limit_override: string | null;
    total_purchase_volume: string;
    on_time_payment_rate: string;
    average_order_value: string;
    customer_tenure_days: number;
    customer: {
        id: number;
        display_name: string;
        credit_limit: string;
        current_balance: string;
    };
};

export function CreditSuggestionCard({ profile }: { profile: CreditProfile }) {
    const activeLimit = profile.owner_credit_limit_override ?? profile.suggested_credit_limit;
    const form = useForm({
        credit_limit: String(activeLimit ?? '0'),
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put(`/credit-discounts/customers/${profile.customer.id}/credit-limit`, {
            preserveScroll: true,
        });
    };

    return (
        <article className="rounded-md border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold">{profile.customer.display_name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Current balance: {profile.customer.current_balance} ETB</p>
                </div>
                <Badge variant={profile.owner_credit_limit_override ? 'secondary' : 'default'}>
                    {profile.owner_credit_limit_override ? 'Owner override' : 'Suggested'}
                </Badge>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                    <p className="text-muted-foreground">Active limit</p>
                    <p className="text-lg font-semibold">{activeLimit} ETB</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Suggested limit</p>
                    <p className="text-lg font-semibold">{profile.suggested_credit_limit} ETB</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Purchase volume</p>
                    <p className="font-medium">{profile.total_purchase_volume} ETB</p>
                </div>
                <div>
                    <p className="text-muted-foreground">On-time rate</p>
                    <p className="font-medium">{profile.on_time_payment_rate}%</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Average order</p>
                    <p className="font-medium">{profile.average_order_value} ETB</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Tenure</p>
                    <p className="font-medium">{profile.customer_tenure_days} days</p>
                </div>
            </div>
            <form onSubmit={submit} className="mt-4 flex gap-2">
                <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.data.credit_limit}
                    onChange={(event) => form.setData('credit_limit', event.target.value)}
                    aria-label={`Credit limit override for ${profile.customer.display_name}`}
                />
                <Button type="submit" variant="outline" disabled={form.processing}>
                    Save
                </Button>
            </form>
            {form.errors.credit_limit && <p className="mt-2 text-sm text-destructive">{form.errors.credit_limit}</p>}
        </article>
    );
}
