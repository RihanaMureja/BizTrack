import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, ExternalLink, Eye, FileText, RotateCcw, X } from 'lucide-react';
import { useMemo, useState } from 'react';
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
type DocumentReview = {
    document_id: number;
    type: string;
    label: string;
    decision: string;
    notes: string | null;
};
type VerificationReview = {
    id: number;
    decision: string;
    reason: string | null;
    document_reviews?: DocumentReview[] | null;
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
type FinalDecision = 'approved' | 'resubmission_required' | 'rejected';
type ReviewDecision = 'approved' | 'resubmission_required' | 'rejected';

const decisionLabels: Record<ReviewDecision, string> = {
    approved: 'Approved',
    resubmission_required: 'Needs resubmission',
    rejected: 'Rejected',
};

export default function AdminBusinessVerificationShow({ business }: Props) {
    const [previewDocument, setPreviewDocument] = useState<VerificationDocument | null>(null);
    const form = useForm({
        decision: 'approved' as FinalDecision,
        reason: '',
        document_reviews: business.verification_documents.map((document) => ({
            document_id: document.id,
            decision: 'approved' as ReviewDecision,
            notes: document.notes ?? '',
        })),
    });

    const reviewSummary = useMemo(() => {
        const rejected = form.data.document_reviews.filter((review) => review.decision === 'rejected').length;
        const resubmission = form.data.document_reviews.filter((review) => review.decision === 'resubmission_required').length;
        const approved = form.data.document_reviews.filter((review) => review.decision === 'approved').length;

        return { approved, rejected, resubmission };
    }, [form.data.document_reviews]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/admin/business-verifications/${business.id}/review`, { preserveScroll: true });
    };

    const updateDocumentDecision = (documentId: number, decision: ReviewDecision) => {
        form.setData('document_reviews', form.data.document_reviews.map((review) => (
            review.document_id === documentId ? { ...review, decision } : review
        )));

        if (decision !== 'approved' && form.data.decision === 'approved') {
            form.setData('decision', decision);
        }
    };

    const updateDocumentNotes = (documentId: number, notes: string) => {
        form.setData('document_reviews', form.data.document_reviews.map((review) => (
            review.document_id === documentId ? { ...review, notes } : review
        )));
    };

    const previewUrl = previewDocument ? `/business-verification-documents/${previewDocument.id}` : '';
    const isPreviewImage = previewDocument ? /\.(jpg|jpeg|png)$/i.test(previewDocument.path) : false;

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
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold">Submitted documents</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Preview each file and record a decision per document.</p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <Badge variant="secondary">{reviewSummary.approved} approved</Badge>
                                    <Badge variant="secondary">{reviewSummary.resubmission} resubmission</Badge>
                                    <Badge variant="secondary">{reviewSummary.rejected} rejected</Badge>
                                </div>
                            </div>
                            <InputError message={form.errors.document_reviews} />
                            <div className="mt-4 grid gap-3">
                                {business.verification_documents.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No verification documents have been submitted yet.</p>
                                ) : business.verification_documents.map((document) => {
                                    const documentReview = form.data.document_reviews.find((review) => review.document_id === document.id);

                                    return (
                                        <div key={document.id} className="rounded-md border bg-background p-4">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <FileText className="size-4 shrink-0 text-primary" />
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">{document.label}</p>
                                                        <p className="text-xs text-muted-foreground">{document.type.replace(/_/g, ' ')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button type="button" variant="outline" size="sm" onClick={() => setPreviewDocument(document)}>
                                                        <Eye className="size-4" />
                                                        Preview
                                                    </Button>
                                                    <Button asChild type="button" variant="ghost" size="sm">
                                                        <a href={`/business-verification-documents/${document.id}`} target="_blank" rel="noreferrer">
                                                            <ExternalLink className="size-4" />
                                                            Open
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-3 md:grid-cols-[14rem_minmax(0,1fr)]">
                                                <Select
                                                    value={documentReview?.decision ?? 'approved'}
                                                    onValueChange={(value) => updateDocumentDecision(document.id, value as ReviewDecision)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="approved">Approved</SelectItem>
                                                        <SelectItem value="resubmission_required">Needs resubmission</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <textarea
                                                    value={documentReview?.notes ?? ''}
                                                    onChange={(event) => updateDocumentNotes(document.id, event.target.value)}
                                                    placeholder="Document-specific note, for example: image unclear, expired license, missing stamp..."
                                                    className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
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
                                        {review.document_reviews && review.document_reviews.length > 0 && (
                                            <div className="mt-3 grid gap-2 border-t pt-3">
                                                {review.document_reviews.map((documentReview) => (
                                                    <div key={`${review.id}-${documentReview.document_id}`} className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <span className="font-medium">{documentReview.label}</span>
                                                            <span className="capitalize text-muted-foreground">{decisionLabels[documentReview.decision as ReviewDecision] ?? documentReview.decision.replace(/_/g, ' ')}</span>
                                                        </div>
                                                        {documentReview.notes && <p className="mt-1 text-muted-foreground">{documentReview.notes}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <form onSubmit={submit} className="h-fit rounded-md border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">Final decision</h2>
                        <p className="mt-1 text-sm text-muted-foreground">The final business status is applied after the document checklist is submitted.</p>
                        <div className="mt-4 grid gap-3">
                            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <input type="radio" name="decision" value="approved" checked={form.data.decision === 'approved'} onChange={(event) => form.setData('decision', event.target.value as FinalDecision)} className="accent-primary" />
                                <Check className="size-4 text-primary" /> Approve business
                            </label>
                            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <input type="radio" name="decision" value="resubmission_required" checked={form.data.decision === 'resubmission_required'} onChange={(event) => form.setData('decision', event.target.value as FinalDecision)} className="accent-primary" />
                                <RotateCcw className="size-4 text-amber-600" /> Request resubmission
                            </label>
                            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <input type="radio" name="decision" value="rejected" checked={form.data.decision === 'rejected'} onChange={(event) => form.setData('decision', event.target.value as FinalDecision)} className="accent-primary" />
                                <X className="size-4 text-destructive" /> Reject business
                            </label>
                            <textarea
                                value={form.data.reason}
                                onChange={(event) => form.setData('reason', event.target.value)}
                                placeholder="Overall reason for rejection or resubmission request..."
                                className="min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            />
                            <InputError message={form.errors.reason} />
                            <Button type="submit" disabled={form.processing}>Submit review</Button>
                        </div>
                    </form>
                </div>
            </div>

            <Dialog open={Boolean(previewDocument)} onOpenChange={(open) => !open && setPreviewDocument(null)}>
                <DialogContent className="max-h-[88vh] max-w-5xl grid-rows-[auto_minmax(0,1fr)]">
                    <DialogHeader>
                        <DialogTitle>{previewDocument?.label ?? 'Document preview'}</DialogTitle>
                        <DialogDescription>Review the submitted file without leaving the verification page.</DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 overflow-hidden rounded-md border bg-muted">
                        {previewDocument && (
                            isPreviewImage ? (
                                <img src={previewUrl} alt={previewDocument.label} className="max-h-[68vh] w-full object-contain" />
                            ) : (
                                <iframe src={previewUrl} title={previewDocument.label} className="h-[68vh] w-full bg-background" />
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>
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
