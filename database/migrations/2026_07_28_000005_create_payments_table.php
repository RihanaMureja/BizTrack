<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->string('payment_status')->default(PaymentStatus::Unpaid->value)->after('status')->index();
            $table->decimal('paid_amount', 12, 2)->default(0)->after('grand_total');
            $table->decimal('balance_due', 12, 2)->default(0)->after('paid_amount');
        });

        DB::table('sales')->update([
            'payment_status' => PaymentStatus::Unpaid->value,
            'paid_amount' => 0,
            'balance_due' => DB::raw('grand_total'),
        ]);

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('payment_number', 60)->unique();
            $table->string('method')->default(PaymentMethod::Cash->value)->index();
            $table->string('status')->default(PaymentStatus::Pending->value)->index();
            $table->decimal('amount', 12, 2);
            $table->string('reference')->nullable()->index();
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'paid_amount', 'balance_due']);
        });
    }
};
