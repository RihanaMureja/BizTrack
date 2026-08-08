<?php

namespace App\Helpers;

/**
 * Business-type-aware dashboard configuration.
 *
 * The authenticated owner's stored `business_type` is mapped to a dashboard
 * group. Each group owns a distinct stat set (KPI cards) and a distinct
 * section set (charts, tables, alerts). Types that behave the same reuse the
 * same group instead of duplicating configuration.
 *
 * Brand color / visual theming is separate and untouched by this class.
 */
class BusinessDashboardConfig
{
    public const GROUP_PERISHABLE = 'perishable';
    public const GROUP_CATALOG = 'catalog';
    public const GROUP_VALUE = 'value';
    public const GROUP_SALES = 'sales';
    public const GROUP_GENERAL = 'general';

    /**
     * @return array{focus: string, subtitle: ?string, stats: list<array{key: string, label: string, trend: string}>, sections: list<string>}
     */
    public static function for(?string $businessType): array
    {
        $group = self::groupFor($businessType);

        return [
            'focus' => self::FOCUS[$group],
            'subtitle' => self::SUBTITLES[$businessType] ?? null,
            'stats' => self::STATS[$group],
            'sections' => self::SECTIONS[$group],
        ];
    }

    public static function groupFor(?string $businessType): string
    {
        return match ($businessType) {
            'grocery_store', 'pharmacy', 'cosmetics' => self::GROUP_PERISHABLE,
            'clothing_store', 'shoes', 'stationery_bookstore' => self::GROUP_CATALOG,
            'electronics', 'furniture', 'auto_parts', 'hardware_building_materials' => self::GROUP_VALUE,
            'general_retail' => self::GROUP_SALES,
            default => self::GROUP_GENERAL,
        };
    }

    /**
     * @return list<string>
     */
    public static function sectionKeysFor(?string $businessType): array
    {
        return self::SECTIONS[self::groupFor($businessType)];
    }

    private const FOCUS = [
        self::GROUP_PERISHABLE => 'stock',
        self::GROUP_CATALOG => 'products',
        self::GROUP_VALUE => 'value',
        self::GROUP_SALES => 'sales',
        self::GROUP_GENERAL => 'general',
    ];

    private const STAT_REVENUE = ['key' => 'revenue_today', 'label' => 'Revenue today', 'trend' => 'Completed sales'];
    private const STAT_SALES = ['key' => 'sales_today', 'label' => 'Sales today', 'trend' => 'POS activity'];
    private const STAT_EXPENSES = ['key' => 'expenses_today', 'label' => 'Expenses today', 'trend' => 'Recorded costs'];
    private const STAT_PRODUCTS = ['key' => 'products', 'label' => 'Products', 'trend' => 'Active catalog items'];
    private const STAT_LOW_STOCK = ['key' => 'low_stock', 'label' => 'Low stock', 'trend' => 'Items to reorder'];
    private const STAT_EXPIRING = ['key' => 'expiring_soon', 'label' => 'Expiring soon', 'trend' => 'Within 30 days'];
    private const STAT_STOCK_VALUE = ['key' => 'stock_value', 'label' => 'Stock value', 'trend' => 'Cost on hand'];
    private const STAT_STAGNANT = ['key' => 'stagnant_count', 'label' => 'Stagnant', 'trend' => 'Need attention'];

    /**
     * @var array<string, list<array{key: string, label: string, trend: string}>>
     */
    private const STATS = [
        self::GROUP_PERISHABLE => [self::STAT_REVENUE, self::STAT_LOW_STOCK, self::STAT_EXPIRING, self::STAT_SALES],
        self::GROUP_CATALOG => [self::STAT_PRODUCTS, self::STAT_SALES, self::STAT_REVENUE, self::STAT_STAGNANT],
        self::GROUP_VALUE => [self::STAT_REVENUE, self::STAT_STOCK_VALUE, self::STAT_SALES, self::STAT_PRODUCTS],
        self::GROUP_SALES => [self::STAT_REVENUE, self::STAT_SALES, self::STAT_EXPENSES, self::STAT_PRODUCTS],
        self::GROUP_GENERAL => [self::STAT_REVENUE, self::STAT_SALES, self::STAT_EXPENSES, self::STAT_PRODUCTS],
    ];

    /**
     * @var array<string, list<string>>
     */
    private const SECTIONS = [
        self::GROUP_PERISHABLE => ['lowStock', 'expiring', 'chart', 'topProducts', 'setup'],
        self::GROUP_CATALOG => ['topProducts', 'chart', 'stagnant', 'lowStock', 'setup'],
        self::GROUP_VALUE => ['stockValue', 'chart', 'lowStock', 'stagnant', 'setup'],
        self::GROUP_SALES => ['chart', 'lowStock', 'stagnant', 'setup'],
        self::GROUP_GENERAL => ['chart', 'lowStock', 'stagnant', 'setup'],
    ];

    private const SUBTITLES = [
        'grocery_store' => 'Keep your shelves stocked — stock alerts, expiring items, revenue, and sales for your grocery or mini market.',
        'clothing_store' => 'Track your catalog and fashion sales — products, turnover, and daily revenue.',
        'shoes' => 'Monitor your shoe inventory, product turnover, and sales performance.',
        'cosmetics' => 'Beauty products move fast — keep an eye on stock, expiring batches, sales, and revenue.',
        'electronics' => 'High-value electronics — watch stock value, product performance, and daily sales.',
        'pharmacy' => 'Medicines and health products — prioritize stock levels and expiry-safe reordering.',
        'furniture' => 'Manage your furniture catalog, stock value, and sales.',
        'hardware_building_materials' => 'Hardware and building materials — track stock value and reorder levels.',
        'stationery_bookstore' => 'Books and stationery — monitor your product catalog and sales.',
        'auto_parts' => 'Auto parts — keep essential parts in stock, track value, and monitor sales.',
        'general_retail' => 'A general view of revenue, sales, stock, and products for your retail store.',
    ];
}
