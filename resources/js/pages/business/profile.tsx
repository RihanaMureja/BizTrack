import { BusinessForm } from '@/components/forms/business-form';
import { Head } from '@inertiajs/react';
import { Building2, Clock3, ShieldCheck } from 'lucide-react';
import type { BusinessFormBusiness, BusinessFormSubscription } from '@/components/forms/business-form';

type Props = {
    business: (BusinessFormBusiness & {
        verification_documents?: Array<{ id: number; label: string; status: string; notes: string | null }>;
        verification_reviews?: Array<{ id: number; decision: string; reason: string | null; reviewed_at: string; status_after: string }>;
    }) | null;
    subscriptions: BusinessFormSubscription[];
};

export default function BusinessProfile({ business, subscriptions }: Props) {
    const statusLabel = business?.status ? business.status.replace(/_/g, ' ') : 'not submitted';
    const isActive = business?.status === 'active';

    return (
        <>
            <Head title="Business Profile" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <Building2 className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Business Profile</h1>
                        <p className="text-sm text-muted-foreground">
                            Core business details used across inventory, sales, receipts, and reports.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,48rem)_minmax(18rem,24rem)]">
                    <section className="rounded-md border bg-card p-5 shadow-sm">
                        <BusinessForm business={business} subscriptions={subscriptions} />
                    </section>

                    <aside className="h-fit rounded-md border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            {isActive ? <ShieldCheck className="size-5 text-primary" /> : <Clock3 className="size-5 text-amber-600" />}
                            <h2 className="font-semibold">Verification status</h2>
                        </div>
                        <div className="mt-4 inline-flex rounded-full border bg-background px-3 py-1 text-xs font-semibold capitalize text-foreground">
                            {statusLabel}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Submit your National ID, FAN number, trade license, and TIN certificate for review.
                            VAT and rental documents are only required when they apply to your business.
                        </p>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Products, inventory, cashiers, customers, sales, expenses, and reports unlock after a
                            super admin approves this business.
                        </p>
                        {business?.verification_documents && business.verification_documents.length > 0 && (
                            <div className="mt-5 border-t pt-4">
                                <h3 className="text-sm font-semibold">Submitted documents</h3>
                                <div className="mt-3 grid gap-2">
                                    {business.verification_documents.map((document) => (
                                        <div key={document.id} className="rounded-md border bg-background px-3 py-2 text-xs">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium">{document.label}</span>
                                                <span className="capitalize text-muted-foreground">{document.status.replace(/_/g, ' ')}</span>
                                            </div>
                                            {document.notes && <p className="mt-1 text-muted-foreground">{document.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {business?.verification_reviews && business.verification_reviews.length > 0 && (
                            <div className="mt-5 border-t pt-4">
                                <h3 className="text-sm font-semibold">Review history</h3>
                                <div className="mt-3 grid gap-2">
                                    {business.verification_reviews.map((review) => (
                                        <div key={review.id} className="rounded-md border bg-background px-3 py-2 text-xs">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium capitalize">{review.decision.replace(/_/g, ' ')}</span>
                                                <span className="text-muted-foreground">{new Date(review.reviewed_at).toLocaleDateString()}</span>
                                            </div>
                                            {review.reason && <p className="mt-1 text-muted-foreground">{review.reason}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}

BusinessProfile.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Business Profile', href: '/business/profile' },
    ],
};
