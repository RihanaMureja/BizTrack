<?php

use App\Helpers\BarcodeHelper;
use App\Helpers\CurrencyHelper;
use App\Helpers\DateHelper;
use App\Helpers\ReportHelper;
use Illuminate\Support\Carbon;

test('currency helper formats regular and compact money values', function () {
    expect(CurrencyHelper::money(1250))->toBe('1,250.00 ETB')
        ->and(CurrencyHelper::compact(1500))->toBe('1.5K ETB')
        ->and(CurrencyHelper::compact(2500000, 'USD'))->toBe('2.5M USD');
});

test('date helper formats labels dates and date times', function () {
    $date = Carbon::parse('2026-07-29 14:35:00');

    expect(DateHelper::label($date))->toBe('Jul 29')
        ->and(DateHelper::date($date))->toBe('Jul 29, 2026')
        ->and(DateHelper::dateTime($date))->toBe('Jul 29, 2026 2:35 PM')
        ->and(DateHelper::date(null))->toBe('-');
});

test('barcode helper normalizes generates and validates barcodes', function () {
    expect(BarcodeHelper::normalize(' ab-12 34 '))->toBe('AB1234')
        ->and(BarcodeHelper::generateSku('Bottled Water', 42))->toBe('BOTT-000042')
        ->and(BarcodeHelper::isValidEan13('4006381333931'))->toBeTrue()
        ->and(BarcodeHelper::isValidEan13('4006381333932'))->toBeFalse();
});

test('report helper formats report slugs and titles', function () {
    expect(ReportHelper::slug('sales_summary'))->toBe('sales-summary')
        ->and(ReportHelper::title('sales_summary'))->toBe('Sales Summary Report');
});
