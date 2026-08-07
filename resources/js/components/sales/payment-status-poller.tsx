export function PaymentStatusPoller({ active }: { active: boolean }) {
    if (!active) {
        return null;
    }

    return (
        <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            Waiting for mobile-money confirmation. Pending payments can be verified from the payment receipt page.
        </div>
    );
}
