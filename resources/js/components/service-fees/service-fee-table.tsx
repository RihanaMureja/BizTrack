import { DataTable } from '@/components/data-table/data-table';
import type { DataTableColumn } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { ServiceFeeStatusBadge } from './service-fee-status-badge';

export type ServiceFeeRow = {
    id: number;
    fee_rate: string;
    payment_amount: string;
    fee_amount: string;
    status: string;
    description: string | null;
    created_at: string;
    business?: { business_name: string } | null;
    payment: {
        payment_number: string;
        reference: string | null;
        sale?: { invoice_number: string } | null;
        customer?: { full_name: string } | null;
    } | null;
} & Record<string, unknown>;

type Props = {
    serviceFees: ServiceFeeRow[];
    admin?: boolean;
    canPay?: boolean;
};

export function ServiceFeeTable({ serviceFees, admin = false, canPay = false }: Props) {
    const columns: DataTableColumn<ServiceFeeRow>[] = [
        {
            key: 'payment',
            header: 'Payment',
            render: (fee) => (
                <div>
                    <p className="font-medium">{fee.payment?.payment_number ?? 'Missing payment'}</p>
                    <p className="text-xs text-muted-foreground">{fee.payment?.sale?.invoice_number ?? fee.payment?.reference ?? 'No reference'}</p>
                </div>
            ),
        },
        ...(admin ? [{
            key: 'business',
            header: 'Business',
            render: (fee: ServiceFeeRow) => fee.business?.business_name ?? 'No business',
        }] satisfies DataTableColumn<ServiceFeeRow>[] : []),
        { key: 'payment_amount', header: 'Payment amount', render: (fee) => `${fee.payment_amount} ETB` },
        { key: 'fee_rate', header: 'Rate', render: (fee) => `${fee.fee_rate}%` },
        { key: 'fee_amount', header: 'Fee', render: (fee) => <span className="font-medium">{fee.fee_amount} ETB</span> },
        { key: 'status', header: 'Status', render: (fee) => <ServiceFeeStatusBadge status={fee.status} /> },
        { key: 'description', header: 'Calculation', render: (fee) => fee.description ?? `${fee.fee_rate}% of ${fee.payment_amount} ETB` },
        ...(canPay ? [{
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (fee: ServiceFeeRow) => fee.status === 'unpaid' ? (
                <Button size="sm" type="button" onClick={() => router.post(`/service-fees/${fee.id}/pay`, {}, { preserveScroll: true })}>
                    <CheckCircle2 className="size-4" /> Pay
                </Button>
            ) : null,
        }] satisfies DataTableColumn<ServiceFeeRow>[] : []),
    ];

    return <DataTable columns={columns} data={serviceFees} rowKey={(fee) => fee.id} emptyMessage="No service fees match the current filters." />;
}
