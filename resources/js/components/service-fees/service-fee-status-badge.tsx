import { Badge } from '@/components/ui/badge';

export function ServiceFeeStatusBadge({ status }: { status: string }) {
    const variant = status === 'paid' ? 'default' : status === 'waived' ? 'secondary' : 'outline';

    return <Badge variant={variant}>{status}</Badge>;
}
