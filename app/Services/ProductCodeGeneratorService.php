<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductCodeGeneratorService
{
    public function barcodeFor(Business $business): string
    {
        $prefix = $this->businessPrefix($business);

        do {
            $barcode = $prefix.'-'.now()->format('ymd').'-'.Str::upper(Str::random(6));
        } while (Product::query()
            ->where('business_id', $business->id)
            ->where('barcode', $barcode)
            ->exists());

        return $barcode;
    }

    public function qrPayloadFor(Business $business, string $barcode): string
    {
        return json_encode([
            'type' => 'biztrack.product',
            'business_id' => $business->id,
            'barcode' => $barcode,
        ], JSON_THROW_ON_ERROR);
    }

    private function businessPrefix(Business $business): string
    {
        $name = preg_replace('/[^A-Za-z0-9]/', '', $business->business_name) ?: 'BIZ';

        return Str::upper(Str::limit($name, 4, '')).str_pad((string) $business->id, 4, '0', STR_PAD_LEFT);
    }
}
