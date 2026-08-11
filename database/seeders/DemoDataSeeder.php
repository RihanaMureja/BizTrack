<?php

namespace Database\Seeders;

use App\Enums\BusinessAccessMode;
use App\Enums\BusinessCategory;
use App\Enums\BusinessPermissionKey;
use App\Enums\ExpenseSource;
use App\Enums\ExpenseStatus;
use App\Enums\InventoryTransactionType;
use App\Enums\NotificationType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ProductInsightStatus;
use App\Enums\ProductInsightType;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Enums\SaleStatus;
use App\Models\Business;
use App\Models\BusinessPermission;
use App\Models\BusinessRole;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\CustomerCreditProfile;
use App\Models\DiscountRule;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Inventory;
use App\Models\InventoryBatch;
use App\Models\InventoryTransaction;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductMovementInsight;
use App\Models\Report;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->resetDemoTables();

        $starter = Subscription::where('name', 'Starter')->first();
        $growth = Subscription::where('name', 'Growth')->first();

        $this->seedBusiness([
            'owner' => [
                'first_name' => 'Mekdes',
                'last_name' => 'Alemu',
                'email' => 'perfume@biztrack.test',
                'phone' => '0912001001',
            ],
            'employee' => [
                'first_name' => 'Liya',
                'last_name' => 'Bekele',
                'email' => 'perfume.employee@biztrack.test',
                'phone' => '0912001002',
                'role_name' => 'Inventory Stylist',
                'salary' => 8500,
                'permissions' => [
                    BusinessPermissionKey::ViewDashboard,
                    BusinessPermissionKey::ManageProducts,
                    BusinessPermissionKey::ManageCategories,
                    BusinessPermissionKey::ManageInventory,
                    BusinessPermissionKey::ViewNotifications,
                ],
            ],
            'business' => [
                'subscription_id' => $growth?->id ?? $starter?->id,
                'business_name' => 'Luna Perfume & Cosmetics',
                'business_type' => 'Perfume and cosmetics shop',
                'business_category' => BusinessCategory::Cosmetics,
                'email' => 'hello@lunacosmetics.test',
                'phone' => '0912300001',
                'address' => 'Bole, Addis Ababa',
                'theme_primary' => '#BE185D',
                'theme_secondary' => '#7C3AED',
                'theme_accent' => '#EA580C',
                'theme_background' => '#FFF7FB',
                'theme_text' => '#18181B',
                'is_vat_registered' => true,
            ],
            'categories' => [
                ['name' => 'Perfumes', 'description' => 'Fragrances and body mists'],
                ['name' => 'Skin Care', 'description' => 'Daily skin care essentials'],
                ['name' => 'Makeup', 'description' => 'Beauty and color cosmetics'],
            ],
            'products' => [
                ['category' => 'Perfumes', 'name' => 'Amber Bloom Eau De Parfum 50ml', 'buy_price' => 1350, 'selling_price' => 2200, 'stock' => 24, 'reorder_level' => 6],
                ['category' => 'Perfumes', 'name' => 'Fresh Oud Body Mist 100ml', 'buy_price' => 480, 'selling_price' => 850, 'stock' => 42, 'reorder_level' => 10],
                ['category' => 'Skin Care', 'name' => 'Hydra Glow Face Serum', 'buy_price' => 620, 'selling_price' => 1150, 'stock' => 18, 'reorder_level' => 5],
                ['category' => 'Makeup', 'name' => 'Velvet Matte Lipstick', 'buy_price' => 210, 'selling_price' => 430, 'stock' => 7, 'reorder_level' => 8],
            ],
            'customers' => [
                ['display_name' => 'Sara Mohammed', 'phone' => '0921000001', 'email' => 'sara@example.test'],
                ['display_name' => 'Nile Beauty Salon', 'customer_type' => 'company', 'contact_person' => 'Hana Tesfaye', 'phone' => '0921000002'],
            ],
            'expense_categories' => ['Supplies', 'Rent', 'Payroll'],
        ]);

        $this->seedBusiness([
            'owner' => [
                'first_name' => 'Dawit',
                'last_name' => 'Tesfaye',
                'email' => 'pharmacy@biztrack.test',
                'phone' => '0913001001',
            ],
            'employee' => [
                'first_name' => 'Bethel',
                'last_name' => 'Mulu',
                'email' => 'pharmacy.employee@biztrack.test',
                'phone' => '0913001002',
                'role_name' => 'Pharmacy Cashier',
                'salary' => 9500,
                'permissions' => [
                    BusinessPermissionKey::ViewDashboard,
                    BusinessPermissionKey::ManageCustomers,
                    BusinessPermissionKey::CreateSales,
                    BusinessPermissionKey::ViewSales,
                    BusinessPermissionKey::ManagePayments,
                    BusinessPermissionKey::ViewNotifications,
                ],
            ],
            'business' => [
                'subscription_id' => $growth?->id ?? $starter?->id,
                'business_name' => 'GreenCare Pharmacy',
                'business_type' => 'Retail pharmacy',
                'business_category' => BusinessCategory::Pharmacy,
                'email' => 'care@greencare.test',
                'phone' => '0913300001',
                'address' => 'Kazanchis, Addis Ababa',
                'theme_primary' => '#047857',
                'theme_secondary' => '#0369A1',
                'theme_accent' => '#0891B2',
                'theme_background' => '#F0FDFA',
                'theme_text' => '#0F172A',
                'is_vat_registered' => false,
            ],
            'categories' => [
                ['name' => 'Pain Relief', 'description' => 'Common pain and fever relief products'],
                ['name' => 'Vitamins', 'description' => 'Supplements and wellness products'],
                ['name' => 'First Aid', 'description' => 'Wound care and first aid supplies'],
            ],
            'products' => [
                ['category' => 'Pain Relief', 'name' => 'Paracetamol 500mg Tablets', 'buy_price' => 70, 'selling_price' => 120, 'stock' => 120, 'reorder_level' => 30, 'expiry_date' => now()->addMonths(18)->toDateString()],
                ['category' => 'Vitamins', 'name' => 'Vitamin C 1000mg Effervescent', 'buy_price' => 210, 'selling_price' => 360, 'stock' => 50, 'reorder_level' => 12, 'expiry_date' => now()->addMonths(20)->toDateString()],
                ['category' => 'First Aid', 'name' => 'Sterile Gauze Pack', 'buy_price' => 45, 'selling_price' => 90, 'stock' => 28, 'reorder_level' => 10, 'expiry_date' => now()->addMonths(30)->toDateString()],
                ['category' => 'Pain Relief', 'name' => 'Ibuprofen 400mg Capsules', 'buy_price' => 95, 'selling_price' => 165, 'stock' => 10, 'reorder_level' => 15, 'expiry_date' => now()->addMonths(12)->toDateString()],
            ],
            'customers' => [
                ['display_name' => 'Abel Girma', 'phone' => '0931000001', 'email' => 'abel@example.test'],
                ['display_name' => 'Sunrise Clinic', 'customer_type' => 'company', 'contact_person' => 'Dr. Ruth', 'phone' => '0931000002'],
            ],
            'expense_categories' => ['Medicine Purchase', 'Rent', 'Payroll'],
        ]);
    }

    private function resetDemoTables(): void
    {
        Schema::disableForeignKeyConstraints();

        foreach ([
            'audit_logs',
            'notifications',
            'reports',
            'product_movement_insights',
            'customer_credits',
            'customer_credit_profiles',
            'discount_rules',
            'payments',
            'sale_items',
            'sales',
            'expenses',
            'expense_categories',
            'inventory_transactions',
            'inventory_batches',
            'inventory',
            'products',
            'categories',
            'customers',
            'business_permission_business_role',
            'business_roles',
            'business_verification_documents',
            'phone_verifications',
            'user_security_questions',
            'passkeys',
            'sessions',
            'businesses',
            'users',
        ] as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
            }
        }

        Schema::enableForeignKeyConstraints();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function seedBusiness(array $data): void
    {
        $ownerData = $data['owner'];
        $employeeData = $data['employee'];
        $businessData = $data['business'];

        $owner = User::create([
            'first_name' => $ownerData['first_name'],
            'last_name' => $ownerData['last_name'],
            'name' => $ownerData['first_name'].' '.$ownerData['last_name'],
            'email' => $ownerData['email'],
            'phone' => $ownerData['phone'],
            'password' => Hash::make('password'),
            'role' => Role::Owner,
            'status' => RecordStatus::Active,
            'email_verified_at' => now(),
            'must_reset_password' => false,
            'password_changed_at' => now(),
        ]);

        $business = Business::create([
            ...$businessData,
            'owner_id' => $owner->id,
            'national_id_fan_number' => 'FAN'.Str::upper(Str::random(8)),
            'has_physical_shop' => true,
            'status' => RecordStatus::Active,
            'access_mode' => BusinessAccessMode::Active,
            'onboarding_completed_at' => now()->subDays(12),
            'trial_started_at' => now()->subDays(12),
            'trial_ends_at' => now()->addDays(18),
            'theme_mode' => 'category',
            'theme_palette_source' => 'category',
            'theme_contrast_adjusted_at' => now(),
        ]);

        $owner->forceFill(['business_id' => $business->id])->save();

        $role = BusinessRole::create([
            'business_id' => $business->id,
            'name' => $employeeData['role_name'],
            'description' => 'Demo role for testing owner-defined employee permissions.',
            'is_default' => true,
        ]);

        $role->permissions()->sync(
            BusinessPermission::query()
                ->whereIn('key', collect($employeeData['permissions'])->map(fn (BusinessPermissionKey $permission) => $permission->value))
                ->pluck('id')
                ->all()
        );

        $employee = User::create([
            'business_id' => $business->id,
            'business_role_id' => $role->id,
            'first_name' => $employeeData['first_name'],
            'last_name' => $employeeData['last_name'],
            'name' => $employeeData['first_name'].' '.$employeeData['last_name'],
            'email' => $employeeData['email'],
            'phone' => $employeeData['phone'],
            'password' => Hash::make('password'),
            'role' => Role::Cashier,
            'status' => RecordStatus::Active,
            'salary' => $employeeData['salary'],
            'email_verified_at' => now(),
            'must_reset_password' => false,
            'password_changed_at' => now(),
        ]);

        $categories = collect($data['categories'])->mapWithKeys(fn (array $category) => [
            $category['name'] => Category::create([
                'business_id' => $business->id,
                'name' => $category['name'],
                'description' => $category['description'],
            ]),
        ]);

        $products = collect($data['products'])->map(function (array $productData, int $index) use ($business, $categories, $owner) {
            $product = Product::create([
                'business_id' => $business->id,
                'category_id' => $categories[$productData['category']]->id,
                'name' => $productData['name'],
                'barcode' => $this->productCode($business, $index + 1),
                'qr_payload' => $this->productQrPayload($business, $productData['name']),
                'description' => 'Demo product for '.$business->business_name.'.',
                'buy_price' => $productData['buy_price'],
                'selling_price' => $productData['selling_price'],
                'unit' => 'pcs',
                'reorder_level' => $productData['reorder_level'],
                'status' => RecordStatus::Active,
            ]);

            $inventory = Inventory::updateOrCreate(
                ['product_id' => $product->id],
                [
                    'quantity' => $productData['stock'],
                    'available_stock' => $productData['stock'],
                    'updated_at' => now(),
                ],
            );

            $batch = InventoryBatch::create([
                'product_id' => $product->id,
                'business_id' => $business->id,
                'batch_number' => 'BATCH-'.$business->id.'-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                'quantity_received' => $productData['stock'],
                'quantity_remaining' => $productData['stock'],
                'unit_cost' => $productData['buy_price'],
                'received_at' => now()->subDays(20 - $index),
                'expiry_date' => $productData['expiry_date'] ?? null,
            ]);

            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'inventory_batch_id' => $batch->id,
                'product_id' => $product->id,
                'business_id' => $business->id,
                'user_id' => $owner->id,
                'type' => InventoryTransactionType::Restock,
                'quantity_change' => $productData['stock'],
                'quantity_before' => 0,
                'quantity_after' => $productData['stock'],
                'notes' => 'Opening demo stock.',
            ]);

            return $product;
        });

        $customers = collect($data['customers'])->map(function (array $customerData) use ($business) {
            $customer = Customer::create([
                'business_id' => $business->id,
                'customer_type' => $customerData['customer_type'] ?? 'individual',
                'display_name' => $customerData['display_name'],
                'full_name' => $customerData['display_name'],
                'contact_person' => $customerData['contact_person'] ?? null,
                'phone' => $customerData['phone'],
                'email' => $customerData['email'] ?? null,
                'address' => 'Addis Ababa',
                'credit_limit' => 0,
                'current_balance' => 0,
            ]);

            CustomerCreditProfile::create([
                'business_id' => $business->id,
                'customer_id' => $customer->id,
                'suggested_credit_limit' => 2500,
                'owner_credit_limit_override' => null,
                'total_purchase_volume' => 0,
                'on_time_payment_rate' => 100,
                'average_order_value' => 0,
                'customer_tenure_days' => 45,
                'calculated_at' => now(),
            ]);

            return $customer;
        });

        DiscountRule::create([
            'business_id' => $business->id,
            'name' => 'Loyal customer discount',
            'spend_threshold' => 3000,
            'discount_percent' => 5,
            'is_active' => true,
        ]);

        $expenseCategories = collect($data['expense_categories'])->mapWithKeys(fn (string $name) => [
            $name => ExpenseCategory::create([
                'business_id' => $business->id,
                'name' => $name,
                'description' => $name.' expenses for demo reporting.',
            ]),
        ]);

        $this->seedSalesAndPayments($business, $employee, $products, $customers);
        $this->seedExpenses($business, $owner, $employee, $expenseCategories);
        $this->seedInsightsAndReports($business, $owner, $products);
    }

    private function seedSalesAndPayments(Business $business, User $employee, $products, $customers): void
    {
        $saleProduct = $products->first();
        $creditProduct = $products->last();
        $customer = $customers->first();
        $creditCustomer = $customers->last();

        $sale = Sale::create([
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'user_id' => $employee->id,
            'invoice_number' => 'INV-'.$business->id.'-0001',
            'is_credit_sale' => false,
            'subtotal' => $saleProduct->selling_price * 2,
            'tax_amount' => $business->is_vat_registered ? ($saleProduct->selling_price * 2) * 0.15 : 0,
            'discount_amount' => 0,
            'vat_enabled' => $business->is_vat_registered,
            'vat_rate' => $business->is_vat_registered ? 15 : 0,
            'grand_total' => $business->is_vat_registered ? ($saleProduct->selling_price * 2) * 1.15 : $saleProduct->selling_price * 2,
            'paid_amount' => $business->is_vat_registered ? ($saleProduct->selling_price * 2) * 1.15 : $saleProduct->selling_price * 2,
            'balance_due' => 0,
            'status' => SaleStatus::Completed,
            'payment_status' => PaymentStatus::Completed,
            'notes' => 'Demo paid sale.',
            'sold_at' => now()->subDays(4),
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $saleProduct->id,
            'quantity' => 2,
            'unit_price' => $saleProduct->selling_price,
            'line_total' => $saleProduct->selling_price * 2,
        ]);

        Payment::create([
            'business_id' => $business->id,
            'sale_id' => $sale->id,
            'customer_id' => $customer->id,
            'user_id' => $employee->id,
            'payment_number' => 'PAY-'.$business->id.'-0001',
            'receipt_number' => 'RCT-'.$business->id.'-0001',
            'method' => PaymentMethod::Cash,
            'status' => PaymentStatus::Completed,
            'amount' => $sale->grand_total,
            'reference' => 'CASH-DEMO',
            'qr_payload' => [
                'type' => 'biztrack_payment_receipt',
                'receipt_number' => 'RCT-'.$business->id.'-0001',
                'invoice_number' => $sale->invoice_number,
                'amount' => (float) $sale->grand_total,
            ],
            'notes' => 'Demo cash payment.',
            'paid_at' => now()->subDays(4),
            'verified_at' => now()->subDays(4),
        ]);

        $creditSubtotal = $creditProduct->selling_price * 3;
        $creditSale = Sale::create([
            'business_id' => $business->id,
            'customer_id' => $creditCustomer->id,
            'user_id' => $employee->id,
            'invoice_number' => 'INV-'.$business->id.'-0002',
            'is_credit_sale' => true,
            'subtotal' => $creditSubtotal,
            'tax_amount' => $business->is_vat_registered ? $creditSubtotal * 0.15 : 0,
            'discount_amount' => 0,
            'vat_enabled' => $business->is_vat_registered,
            'vat_rate' => $business->is_vat_registered ? 15 : 0,
            'grand_total' => $business->is_vat_registered ? $creditSubtotal * 1.15 : $creditSubtotal,
            'paid_amount' => 0,
            'balance_due' => $business->is_vat_registered ? $creditSubtotal * 1.15 : $creditSubtotal,
            'status' => SaleStatus::Completed,
            'payment_status' => PaymentStatus::Unpaid,
            'notes' => 'Demo credit sale.',
            'sold_at' => now()->subDays(2),
        ]);

        SaleItem::create([
            'sale_id' => $creditSale->id,
            'product_id' => $creditProduct->id,
            'quantity' => 3,
            'unit_price' => $creditProduct->selling_price,
            'line_total' => $creditSubtotal,
        ]);

        CustomerCredit::create([
            'business_id' => $business->id,
            'customer_id' => $creditCustomer->id,
            'sale_id' => $creditSale->id,
            'credit_amount' => $creditSale->grand_total,
            'paid_amount' => 0,
            'remaining_balance' => $creditSale->grand_total,
            'status' => PaymentStatus::Unpaid,
            'due_date' => now()->addDays(14)->toDateString(),
        ]);

        $creditCustomer->forceFill(['current_balance' => $creditSale->grand_total])->save();
        $creditCustomer->creditProfile?->forceFill([
            'total_purchase_volume' => $creditSale->grand_total,
            'average_order_value' => $creditSale->grand_total,
            'suggested_credit_limit' => max(2500, (float) $creditSale->grand_total * 1.25),
            'calculated_at' => now(),
        ])->save();
    }

    private function seedExpenses(Business $business, User $owner, User $employee, $expenseCategories): void
    {
        Expense::create([
            'business_id' => $business->id,
            'expense_category_id' => $expenseCategories->first()->id,
            'user_id' => $owner->id,
            'title' => 'Opening stock purchase',
            'amount' => 12500,
            'expense_date' => now()->subDays(20)->toDateString(),
            'status' => ExpenseStatus::Paid,
            'source' => ExpenseSource::Restock,
            'source_reference_type' => InventoryBatch::class,
            'source_reference_id' => InventoryBatch::where('business_id', $business->id)->oldest()->value('id'),
            'vendor' => 'Demo Supplier',
            'notes' => 'Auto-generated restock expense demo.',
        ]);

        Expense::create([
            'business_id' => $business->id,
            'expense_category_id' => $expenseCategories->get('Payroll')?->id ?? $expenseCategories->last()->id,
            'user_id' => $owner->id,
            'title' => 'Monthly payroll - '.$employee->name,
            'amount' => $employee->salary,
            'expense_date' => now()->startOfMonth()->toDateString(),
            'status' => ExpenseStatus::Paid,
            'source' => ExpenseSource::Payroll,
            'source_reference_type' => User::class,
            'source_reference_id' => $employee->id,
            'source_period' => now()->format('Y-m'),
            'vendor' => $employee->name,
            'notes' => 'Scheduled payroll expense demo.',
        ]);
    }

    private function seedInsightsAndReports(Business $business, User $owner, $products): void
    {
        $lowProduct = $products->last();

        ProductMovementInsight::create([
            'business_id' => $business->id,
            'product_id' => $lowProduct->id,
            'type' => ProductInsightType::Stagnant,
            'status' => ProductInsightStatus::Open,
            'days_without_sale' => 45,
            'threshold_days' => 30,
            'stock_on_hand' => $lowProduct->inventory?->available_stock ?? 0,
            'last_sold_at' => now()->subDays(45),
            'detected_at' => now()->subDay(),
            'notified_at' => now()->subDay(),
            'suggested_action' => 'Consider a small discount or feature this item in the dashboard promotion list.',
        ]);

        Notification::create([
            'business_id' => $business->id,
            'user_id' => $owner->id,
            'title' => 'Stagnant product detected',
            'message' => $lowProduct->name.' has not sold recently. Consider promotion or review pricing.',
            'type' => NotificationType::StagnantProduct,
            'is_read' => false,
        ]);

        Notification::create([
            'business_id' => $business->id,
            'user_id' => $owner->id,
            'title' => 'Trial active',
            'message' => 'Your demo trial is active and ready for testing.',
            'type' => NotificationType::DailySales,
            'is_read' => true,
        ]);

        Report::create([
            'business_id' => $business->id,
            'user_id' => $owner->id,
            'type' => 'sales_summary',
            'title' => 'Demo sales summary',
            'date_from' => now()->subDays(30)->toDateString(),
            'date_to' => now()->toDateString(),
            'filters' => ['demo' => true],
            'summary' => [
                'sales_count' => 2,
                'products_count' => $products->count(),
            ],
            'generated_at' => now(),
        ]);
    }

    private function productCode(Business $business, int $sequence): string
    {
        $prefix = Str::of($business->business_name)
            ->replaceMatches('/[^A-Za-z0-9]/', '')
            ->upper()
            ->substr(0, 4)
            ->padRight(4, 'X');

        return $prefix.'-'.$business->id.'-'.str_pad((string) $sequence, 6, '0', STR_PAD_LEFT);
    }

    private function productQrPayload(Business $business, string $productName): string
    {
        return json_encode([
            'type' => 'biztrack_product',
            'business' => $business->business_name,
            'product' => $productName,
        ], JSON_THROW_ON_ERROR);
    }
}
