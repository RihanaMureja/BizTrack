type Props = {
    barcode: string;
    qrPayload: string | null;
};

function codeBars(value: string) {
    return value.split('').map((char, index) => {
        const width = (char.charCodeAt(0) % 4) + 1;

        return <span key={`${char}-${index}`} className="block h-14 bg-foreground" style={{ width }} />;
    });
}

export function ProductCodePreview({ barcode, qrPayload }: Props) {
    const qrCells = Array.from({ length: 49 }, (_, index) => {
        const source = `${qrPayload ?? barcode}${index}`;
        const filled = source.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3 !== 0;

        return <span key={index} className={filled ? 'bg-foreground' : 'bg-background'} />;
    });

    return (
        <div className="grid gap-4 md:grid-cols-[1fr_8rem]">
            <div className="rounded-md border bg-background p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">Code128 barcode value</p>
                <div className="mt-3 flex h-16 items-end gap-0.5 overflow-hidden rounded-sm bg-background">
                    {codeBars(barcode)}
                </div>
                <p className="mt-3 break-all font-mono text-sm font-semibold">{barcode}</p>
            </div>
            <div className="rounded-md border bg-background p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">QR payload</p>
                <div className="mt-3 grid aspect-square grid-cols-7 gap-0.5 rounded-sm border bg-background p-1">
                    {qrCells}
                </div>
            </div>
        </div>
    );
}
