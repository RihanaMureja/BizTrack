import { QRCodeSVG } from 'qrcode.react';

type Props = {
    payload: unknown;
};

export function PaymentQrCode({ payload }: Props) {
    const encoded = JSON.stringify(payload ?? {});

    return (
        <div className="mx-auto flex aspect-square w-36 items-center justify-center rounded-sm border border-slate-300 bg-white p-2">
            <QRCodeSVG value={encoded} size={128} level="M" includeMargin />
        </div>
    );
}
