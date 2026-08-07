import { BusinessForm } from '@/components/forms/business-form';
import type { BusinessFormBusiness, BusinessFormSubscription } from '@/components/forms/business-form';
import Heading from '@/components/heading';
import { Head } from '@inertiajs/react';
import { Building2, Eye } from 'lucide-react';

type Props = {
    business: (BusinessFormBusiness & {
        verification_documents?: Array<{ id: number; label: string; status: string; notes: string | null }>;
    }) | null;
    subscriptions: BusinessFormSubscription[];
};

export default function BusinessSettings({ business, subscriptions }: Props) {
    return (
        <>
            <Head title="Business settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Business"
                    description="Manage business details used on receipts, reports, inventory, and sales."
                />

                <section className="rounded-md border bg-card p-5 shadow-sm">
                    <BusinessForm business={business} subscriptions={subscriptions} action="/settings/business" />
                </section>

                <section className="rounded-md border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Building2 className="size-5 text-primary" />
                        <h2 className="font-semibold">Business records</h2>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        National ID, trade license, TIN, VAT, and rental files are optional profile documents.
                        They are not reviewed by super admins and they do not control system access.
                    </p>

                    {business?.verification_documents && business.verification_documents.length > 0 && (
                        <div className="mt-5 grid gap-2">
                            {business.verification_documents.map((document) => (
                                <div key={document.id} className="rounded-md border bg-background px-3 py-2 text-xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium">{document.label}</span>
                                        <span className="capitalize text-muted-foreground">{document.status.replace(/_/g, ' ')}</span>
                                    </div>
                                    {document.notes && <p className="mt-1 text-muted-foreground">{document.notes}</p>}
                                    <a
                                        href={`/business-verification-documents/${document.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 font-medium text-primary transition hover:text-primary/80"
                                    >
                                        <Eye className="size-3.5" />
                                        Preview document
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

BusinessSettings.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Business', href: '/settings/business' },
    ],
};
