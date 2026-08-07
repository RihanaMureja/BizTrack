import { ProductForm } from '@/components/forms/product-form';
import type { ProductFormCategory, ProductFormProduct } from '@/components/forms/product-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: ProductFormCategory[];
    product: ProductFormProduct | null;
};

export function ProductFormModal({ open, onOpenChange, categories, product }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product?.id ? 'Edit product' : 'New product'}</DialogTitle>
                </DialogHeader>
                <ProductForm categories={categories} product={product} onSuccess={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    );
}
