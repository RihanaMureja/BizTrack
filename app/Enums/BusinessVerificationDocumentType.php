<?php

namespace App\Enums;

enum BusinessVerificationDocumentType: string
{
    case NationalId = 'national_id';
    case TradeLicense = 'trade_license';
    case TinCertificate = 'tin_certificate';
    case VatCertificate = 'vat_certificate';
    case RentalAgreement = 'rental_agreement';

    public function label(): string
    {
        return match ($this) {
            self::NationalId => 'National ID photo',
            self::TradeLicense => 'Business license / trade license',
            self::TinCertificate => 'Tax certificate / TIN',
            self::VatCertificate => 'VAT certificate',
            self::RentalAgreement => 'Rental agreement / shop ownership proof',
        };
    }
}
