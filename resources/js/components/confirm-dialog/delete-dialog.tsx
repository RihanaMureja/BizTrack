import { ConfirmDialog } from '@/components/confirm-dialog/confirm-dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemLabel: string;
    onConfirm: () => void;
    processing?: boolean;
    description?: string;
};

export function DeleteDialog({ open, onOpenChange, itemLabel, onConfirm, processing = false, description }: Props) {
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title={`Delete ${itemLabel}?`}
            description={description ?? `This will permanently remove ${itemLabel}. This action cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            variant="destructive"
            processing={processing}
            onConfirm={onConfirm}
        />
    );
}
