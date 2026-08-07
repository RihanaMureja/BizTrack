type Props = {
    payload: unknown;
};

export function PaymentQrCode({ payload }: Props) {
    const encoded = JSON.stringify(payload ?? {});
    const cells = Array.from({ length: 81 }, (_, index) => {
        const source = `${encoded}:${index}`;
        const filled = source.split('').reduce((sum, char) => sum + char.charCodeAt(0), index) % 4 !== 0;

        return <span key={index} className={filled ? 'bg-slate-950' : 'bg-white'} />;
    });

    return (
        <div className="mx-auto grid aspect-square w-32 grid-cols-9 gap-0.5 rounded-sm border border-slate-300 bg-white p-1">
            {cells}
        </div>
    );
}
