import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Bell,
    Mail,
    Phone,
    ReceiptText,
    UserRound,
} from 'lucide-react';

type Props = {
    customer: {
        id: number;
        full_name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        credit_limit: string;
        current_balance: string;
        credits: Credit[];
    };
    purchaseHistory: Credit[];
    paymentHistory: { reliability_score: number };
    latestCreditLimitAdjustment: {
        new_values: { credit_limit?: number };
        created_at: string;
    } | null;
};

type Credit = {
    id: number;
    credit_amount: string;
    paid_amount: string;
    remaining_balance: string;
    status: string;
    due_date: string | null;
    reminded_at: string | null;
    sale: { invoice_number: string } | null;
};

export default function CustomerShow({
    customer,
    purchaseHistory,
    paymentHistory,
    latestCreditLimitAdjustment,
}: Props) {
    const activeCredits = customer.credits.filter(
        (credit) => Number(credit.remaining_balance) > 0,
    );
    const scoreClass =
        paymentHistory.reliability_score >= 80
            ? 'bg-emerald-600 text-white'
            : paymentHistory.reliability_score >= 50
              ? 'border-amber-500 text-amber-700 dark:text-amber-400'
              : 'bg-rose-600 text-white';

    return (
        <>
            <Head title={customer.full_name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <UserRound className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">
                                {customer.full_name}
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span>
                                    Customer profile, credit balance, and
                                    purchase history.
                                </span>
                                <Badge variant="outline" className={scoreClass}>
                                    Reliability{' '}
                                    {paymentHistory.reliability_score}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/customers">
                            <ArrowLeft className="size-4" />
                            Back to customers
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <p className="flex items-center gap-2">
                                <Phone className="size-4 text-muted-foreground" />
                                {customer.phone || 'No phone'}
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="size-4 text-muted-foreground" />
                                {customer.email || 'No email'}
                            </p>
                            <p className="text-muted-foreground">
                                {customer.address || 'No address recorded'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Credit</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Credit limit
                                </p>
                                <p className="text-2xl font-semibold">
                                    {customer.credit_limit} ETB
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Current balance
                                </p>
                                <p className="text-2xl font-semibold">
                                    {customer.current_balance} ETB
                                </p>
                            </div>
                            {latestCreditLimitAdjustment && (
                                <p className="text-xs text-muted-foreground">
                                    Limit auto-adjusted to{' '}
                                    {latestCreditLimitAdjustment.new_values
                                        .credit_limit ??
                                        customer.credit_limit}{' '}
                                    ETB on{' '}
                                    {new Date(
                                        latestCreditLimitAdjustment.created_at,
                                    ).toLocaleDateString()}
                                    .
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase History</CardTitle>
                        </CardHeader>
                        <CardContent className="flex min-h-32 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                            <ReceiptText className="size-8" />
                            {purchaseHistory.length === 0
                                ? 'Purchase history will appear after sales are completed.'
                                : `${purchaseHistory.length} credit-linked purchases`}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activeCredits.length === 0 ? (
                            <div className="flex min-h-28 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                                <Bell className="size-8" />
                                No active credit balance for this customer.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {activeCredits.map((credit) => (
                                    <div
                                        key={credit.id}
                                        className="flex flex-col justify-between gap-3 rounded-md border p-4 sm:flex-row sm:items-center"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {credit.sale?.invoice_number ??
                                                    'Sale credit'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Due{' '}
                                                {credit.due_date ?? 'not set'} |
                                                Status {credit.status}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                            <div className="min-w-32 text-sm">
                                                <p className="text-muted-foreground">
                                                    Remaining
                                                </p>
                                                <p className="font-semibold">
                                                    {credit.remaining_balance}{' '}
                                                    ETB
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    router.post(
                                                        `/customer-credits/${credit.id}/remind`,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                Send reminder
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    router.post(
                                                        `/customer-credits/${credit.id}/overdue`,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                Mark overdue
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CustomerShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/customers' },
        { title: 'Profile', href: '#' },
    ],
};
