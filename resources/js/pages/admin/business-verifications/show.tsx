import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, FileText, RotateCcw, X } from 'lucide-react';
import type { FormEvent } from 'react';

type User = { first_name: string | null; last_name: string | null; email: string };
type VerificationDocument = {
    id: number;
    type: string;
    label: string;
    path: string;
    status: string;
    notes: string | null;
    reviewed_at: string | null;
    reviewer: User | null;
};
type VerificationReview = {
    id: number;
    decision: string;
    reason: string | null;
    status_before: string | null;
    status_after: string;
    reviewed_at: string;
    reviewer: User | null;
};
type Business = {
    id: number;
    business_name: string;
    business_type: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: string;
    national_id_fan_number: string | null;
    is_vat_registered: boolean;
    has_physical_shop: boolean;
    owner: User | null;
    subscription: { name: string; price: string | number } | null;
    verification_documents: VerificationDocument[];
    verification_reviews: VerificationReview[];
};

type Props = { business: Business };

export default function AdminBusinessVerificationShow({ business }: Props) {
    const form = useForm({ decision: 'approved', reason: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/admin/business-verifications/${business.id}/review`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Review ${business.business_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/admin/businesses"><ArrowLeft className="size-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold">Business Verification</h1>
                            <p className="text-sm text-muted-foreground">{business.business_name}</p>
                        </div>
                    </div>
                    <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>{business.status.replace(/_/g, ' ')}</Badge>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div className="grid gap-6">
                        <section className="rounded-md border bg-card p-5 shadow-sm">
                            <h2 className="font-semibold">Business details</h2>
                            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                                <Detail label="Owner" value={business.owner?.email ?? 'No owner'} />
                                <Detail label="Plan" value={business.subscription?.name ?? 'No plan'} />
                                <Detail label="Business type" value={business.business_type ?? 'Not set'} />
                                <Detail label="Email" value={business.email ?? 'Not set'} />
                                <Detail label="Phone" value={business.phone ?? 'Not set'} />
                                <Detail label="National ID FAN" value={business.national_id_fan_number ?? 'Not set'} />
                                <Detail label="VAT registered" value={business.is_vat_registered ? 'Yes' : 'No'} />
                                <Detail label="Physical shop" value={business.has_physical_shop ? 'Yes' : 'No'} />
                            </div>
                        </section>

                        <section className="rounded-md border bg-card p-5 shadow-sm">
                            <h2 className="font-semibold">Submitted documents</h2>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                {business.verification_documents.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No verification documents have been submitted yet.</p>
                                ) : business.verification_documents.map((document) => (
                                    <a
                                        key={document.id}
                                        href={`/storage/${document.path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-md border bg-background p-4 transition hover:border-primary/50 hover:bg-accent"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="size-4 text-primary" />
                                                <p className="font-medium">{document.label}</p>
                                            </div>
                                            <Badge variant={document.status === 'active' ? 'default' : 'secondary'}>{document.status.replace(/_/g, ' ')}</Badge>
                                        </div>
                                        {document.notes && <p className="mt-2 text-xs text-muted-foreground">{document.notes}</p>}
                                    </a>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-md border bg-card p-5 shadow-sm">
                            <h2 className="font-semibold">Review timeline</h2>
                            <div className="mt-4 grid gap-3">
                                {business.verification_reviews.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No review decisions recorded yet.</p>
                                ) : business.verification_reviews.map((review) => (
                                    <div key={review.id} className="rounded-md border bg-background p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="font-medium capitalize">{review.decision.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(review.reviewed_at).toLocaleString()}</p>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {review.status_before?.replace(/_/g, ' ') ?? 'none'} to {review.status_after.replace(/_/g, ' ')}
                                        </p>
                                        {review.reason && <p className="mt-2 text-sm">{review.reason}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <form onSubmit={submit} className="h-fit rounded-md border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">Review decision</h2>
                        <div className="mt-4 grid gap-3">
                            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <input type="radio" name="decision" value="approved" checked={form.data.decision === 'approved'} onChange={(event) => form.setData('decision', event.target.value)} className="accent-primary" />
                                <Check className="size-4 text-primary" /> Approve business
                            </label>
                            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <input type="radio" name="decision" value="resubmission_required" checked={form.data.decision === 'resubmission_required'} onChange={(event) => form.setData('decision', event.target.value)} className="accent-primary" />
                                <RotateCcw className="size-4 text-amber-600" /> Request resubmission
                            </label>
                            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <input type="radio" name="decision" value="rejected" checked={form.data.decision === 'rejected'} onChange={(event) => form.setData('decision', event.target.value)} className="accent-primary" />
                                <X className="size-4 text-destructive" /> Reject business
                            </label>
                            <textarea
                                value={form.data.reason}
                                onChange={(event) => form.setData('reason', event.target.value)}
                                placeholder="Reason for rejection or resubmission request..."
                                className="min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            />
                            <InputError message={form.errors.reason} />
                            <Button type="submit" disabled={form.processing}>Submit review</Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border bg-background p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
        </div>
    );
}

AdminBusinessVerificationShow.layout = {
    breadcrumbs: [
        { title: 'Super Admin', href: '/admin' },
        { title: 'Businesses', href: '/admin/businesses' },
        { title: 'Verification', href: '#' },
    ],
};
