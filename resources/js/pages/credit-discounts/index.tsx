import { DeleteDialog } from '@/components/confirm-dialog/delete-dialog';
import { CreditSuggestionCard } from '@/components/credit-discounts/credit-suggestion-card';
import type { CreditProfile } from '@/components/credit-discounts/credit-suggestion-card';
import { DiscountRuleForm } from '@/components/credit-discounts/discount-rule-form';
import type { DiscountRule } from '@/components/credit-discounts/discount-rule-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router } from '@inertiajs/react';
import { BadgePercent, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Props = {
    discountRules: DiscountRule[];
    creditProfiles: CreditProfile[];
};

export default function CreditDiscountIndex({ discountRules, creditProfiles }: Props) {
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<DiscountRule | null>(null);
    const [deleting, setDeleting] = useState<DiscountRule | null>(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const confirmDelete = () => {
        if (!deleting?.id) return;

        setProcessingDelete(true);
        router.delete(`/credit-discounts/rules/${deleting.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessingDelete(false);
                setDeleting(null);
            },
        });
    };

    return (
        <>
            <Head title="Credit & Discounts" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <BadgePercent className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Credit & Discounts</h1>
                            <p className="text-sm text-muted-foreground">Manage tiered discount rules and customer credit suggestions in one place.</p>
                        </div>
                    </div>
                    <Button type="button" onClick={() => setCreating(true)}>
                        <Plus className="size-4" />
                        New rule
                    </Button>
                </div>

                <section className="grid gap-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="font-semibold">Tiered discount rules</h2>
                        <p className="text-sm text-muted-foreground">{discountRules.length} rules</p>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-3">
                        {discountRules.length === 0 && (
                            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground lg:col-span-3">
                                No discount rules yet. Create the first spend threshold to reward loyal customers automatically.
                            </div>
                        )}
                        {discountRules.map((rule) => (
                            <article key={rule.id} className="rounded-md border bg-card p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold">{rule.name}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">Spend {rule.spend_threshold} ETB in 30 days</p>
                                    </div>
                                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>{rule.is_active ? 'Active' : 'Inactive'}</Badge>
                                </div>
                                <p className="mt-4 text-2xl font-semibold">{rule.discount_percent}% off</p>
                                <div className="mt-4 flex gap-2">
                                    <Button type="button" size="sm" variant="outline" onClick={() => setEditing(rule)}>
                                        <Pencil className="size-4" />
                                        Edit
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => setDeleting(rule)}>
                                        <Trash2 className="size-4" />
                                        Delete
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="grid gap-4">
                    <div>
                        <h2 className="font-semibold">Credit limit suggestions</h2>
                        <p className="text-sm text-muted-foreground">Suggestions are calculated from purchase volume, payment punctuality, average order value, and customer tenure. The customer's credit limit remains the owner override.</p>
                    </div>
                    <div className="grid gap-3 xl:grid-cols-2">
                        {creditProfiles.length === 0 && (
                            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground xl:col-span-2">
                                Credit suggestions will appear after customers are created and sales history exists.
                            </div>
                        )}
                        {creditProfiles.map((profile) => <CreditSuggestionCard key={profile.id} profile={profile} />)}
                    </div>
                </section>
            </div>

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New discount rule</DialogTitle></DialogHeader>
                    <DiscountRuleForm onSuccess={() => setCreating(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit discount rule</DialogTitle></DialogHeader>
                    <DiscountRuleForm rule={editing} onSuccess={() => setEditing(null)} />
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={Boolean(deleting)}
                onOpenChange={(open) => !open && setDeleting(null)}
                itemLabel={deleting?.name ?? 'this rule'}
                onConfirm={confirmDelete}
                processing={processingDelete}
            />
        </>
    );
}

CreditDiscountIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Credit & Discounts', href: '/credit-discounts' },
    ],
};
