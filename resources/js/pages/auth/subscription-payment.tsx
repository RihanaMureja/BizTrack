import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Info, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    plan: {
        id: number;
        name: string;
        price: string | number;
        duration_months: number;
        duration_days: number | null;
        max_cashiers: number;
        description: string | null;
        features: string[] | null;
    };
    business: {
        id: number;
        business_name: string;
    };
    returnTo?: string;
};

export default function SubscriptionPayment({
    plan,
    business,
    returnTo,
}: Props) {
    const { flash } = usePage().props as { flash?: { error?: string } };
    const { data, post, processing } = useForm({ plan_id: plan.id });

    const goBack = () => {
        const fallback =
            returnTo === '/business/subscriptions'
                ? '/business/subscriptions'
                : '/subscriptions';
        router.visit(`${fallback}?plan=${plan.id}`);
    };

    const pay = (e: React.FormEvent) => {
        e.preventDefault();
        post('/subscriptions/payment/initialize');
    };

    const isFree = Number(plan.price) === 0;

    return (
        <>
            <Head title="Payment Methods" />

            <div className="mb-4 flex">
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={goBack}
                    aria-label="Go back"
                    title="Go back"
                >
                    <ArrowLeft className="size-4" />
                </Button>
            </div>

            <div className="text-center">
                <h1 className="text-2xl font-semibold">Payment Methods</h1>
                <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
                    Complete the secure payment to activate your {plan.name}{' '}
                    plan for {business.business_name}.
                </p>
            </div>

            <div className="mx-auto mt-8 w-full max-w-2xl">
                <section className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">{plan.name}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {plan.description}
                            </p>
                        </div>
                        <Badge variant="outline">Monthly</Badge>
                    </div>

                    <div className="mt-6 flex items-baseline gap-1">
                        <span className="text-3xl font-semibold">
                            {isFree
                                ? 'Free'
                                : `${Number(plan.price).toLocaleString()} ETB`}
                        </span>
                        {!isFree && (
                            <span className="text-sm text-muted-foreground">
                                / month
                            </span>
                        )}
                    </div>

                    {plan.features && plan.features.length > 0 && (
                        <ul className="mt-5 space-y-2">
                            {plan.features.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="mt-4 rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 font-semibold">
                        <Lock className="size-4" />
                        Pay securely with Chapa
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        You will be redirected to Chapa, where you can pay with
                        Telebirr, CBE Birr, or card. Your subscription activates
                        automatically once the payment is confirmed.
                    </p>

                    <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-card text-sm font-bold text-primary shadow-sm">
                            Chapa
                        </span>
                        <div className="text-sm">
                            <p className="font-medium">Chapa</p>
                            <p className="text-muted-foreground">
                                Telebirr · CBE Birr · Cards
                            </p>
                        </div>
                        <Badge className="ml-auto">Recommended</Badge>
                    </div>

                    <form onSubmit={pay} className="mt-4">
                        <input
                            type="hidden"
                            name="plan_id"
                            value={data.plan_id}
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing || isFree}
                        >
                            {processing && <Spinner />}
                            {processing
                                ? 'Redirecting to Chapa…'
                                : `Pay ${Number(plan.price).toLocaleString()} ETB with Chapa`}
                        </Button>
                    </form>

                    {flash?.error && (
                        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                            {flash.error}
                        </div>
                    )}
                </section>

                <div className="mt-4 flex items-start gap-2 rounded-lg border bg-muted/40 p-4 text-sm">
                    <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="text-muted-foreground">
                        Your plan activates immediately after Chapa confirms the
                        payment. If the payment is interrupted, you can return
                        to this page and try again — you will not be charged
                        twice.
                    </p>
                </div>
            </div>
        </>
    );
}

SubscriptionPayment.layout = {
    title: 'Payment Methods',
    description: 'Complete payment to activate your plan',
};
