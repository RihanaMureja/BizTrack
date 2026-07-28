import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, ReceiptText, UserRound } from 'lucide-react';

type Props = {
    customer: {
        id: number;
        full_name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        credit_limit: string;
        current_balance: string;
    };
    purchaseHistory: unknown[];
};

export default function CustomerShow({ customer, purchaseHistory }: Props) {
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
                            <h1 className="text-xl font-semibold">{customer.full_name}</h1>
                            <p className="text-sm text-muted-foreground">Customer profile and future purchase history.</p>
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
                        <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" />{customer.phone || 'No phone'}</p>
                            <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" />{customer.email || 'No email'}</p>
                            <p className="text-muted-foreground">{customer.address || 'No address recorded'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Credit</CardTitle></CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Credit limit</p>
                                <p className="text-2xl font-semibold">{customer.credit_limit} ETB</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Current balance</p>
                                <p className="text-2xl font-semibold">{customer.current_balance} ETB</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Purchase History</CardTitle></CardHeader>
                        <CardContent className="flex min-h-32 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                            <ReceiptText className="size-8" />
                            {purchaseHistory.length === 0 ? 'Purchase history will appear after the sales module is active.' : `${purchaseHistory.length} purchases`}
                        </CardContent>
                    </Card>
                </div>
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
