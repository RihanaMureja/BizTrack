<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Enums\ServiceFeeStatus;
use App\Models\Business;
use App\Models\Payment;
use App\Models\ServiceFee;
use App\Models\ServiceFeeSetting;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ServiceFeeService
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function settingFor(Business $business): ServiceFeeSetting
    {
        return $business->serviceFeeSetting()->firstOrCreate([], [
            'fee_rate' => 1.00,
            'is_active' => true,
            'terms' => 'Default BizTrack platform service fee charged on completed sale payments.',
            'effective_from' => now()->toDateString(),
        ]);
    }

    public function createForPayment(Payment $payment): ?ServiceFee
    {
        $payment->loadMissing(['business', 'sale']);

        if ($payment->status !== PaymentStatus::Completed || (float) $payment->amount <= 0) {
            return null;
        }

        return DB::transaction(function () use ($payment): ?ServiceFee {
            $setting = $this->settingFor($payment->business);

            if (! $setting->is_active || (float) $setting->fee_rate <= 0) {
                return null;
            }

            $feeAmount = round(((float) $payment->amount * (float) $setting->fee_rate) / 100, 2);

            return ServiceFee::query()->firstOrCreate(
                ['payment_id' => $payment->id],
                [
                    'business_id' => $payment->business_id,
                    'service_fee_setting_id' => $setting->id,
                    'fee_rate' => $setting->fee_rate,
                    'payment_amount' => $payment->amount,
                    'fee_amount' => $feeAmount,
                    'status' => ServiceFeeStatus::Unpaid,
                    'description' => "{$setting->fee_rate}% platform service fee from payment {$payment->payment_number}.",
                ],
            );
        });
    }

    public function paginateForBusiness(Business $business, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->where('business_id', $business->id)
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function paginateForAdmin(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->with('business.owner')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function summaryForBusiness(Business $business): array
    {
        $fees = ServiceFee::query()->where('business_id', $business->id);

        return [
            'total_owed' => (float) (clone $fees)->where('status', ServiceFeeStatus::Unpaid->value)->sum('fee_amount'),
            'total_paid' => (float) (clone $fees)->where('status', ServiceFeeStatus::Paid->value)->sum('fee_amount'),
            'total_generated' => (float) (clone $fees)->sum('fee_amount'),
            'unpaid_count' => (clone $fees)->where('status', ServiceFeeStatus::Unpaid->value)->count(),
        ];
    }

    public function platformSummary(): array
    {
        $fees = ServiceFee::query();

        return [
            'total_owed' => (float) (clone $fees)->where('status', ServiceFeeStatus::Unpaid->value)->sum('fee_amount'),
            'total_paid' => (float) (clone $fees)->where('status', ServiceFeeStatus::Paid->value)->sum('fee_amount'),
            'total_generated' => (float) (clone $fees)->sum('fee_amount'),
            'unpaid_count' => (clone $fees)->where('status', ServiceFeeStatus::Unpaid->value)->count(),
        ];
    }

    public function markPaid(ServiceFee $serviceFee, User $user): ServiceFee
    {
        if ($serviceFee->status === ServiceFeeStatus::Paid) {
            return $serviceFee;
        }

        $oldValues = $serviceFee->only(['status', 'paid_at']);

        $serviceFee->forceFill([
            'status' => ServiceFeeStatus::Paid,
            'paid_at' => now(),
        ])->save();

        $this->auditLogService->log(
            action: 'service_fee.paid',
            auditable: $serviceFee,
            business: $serviceFee->business,
            oldValues: $oldValues,
            newValues: $serviceFee->only(['status', 'paid_at']),
            user: $user,
        );

        return $serviceFee->refresh();
    }

    public function updateSetting(Business $business, array $data, User $user): ServiceFeeSetting
    {
        $setting = $this->settingFor($business);
        $oldValues = $setting->only(['fee_rate', 'is_active', 'terms', 'effective_from']);

        $setting->fill($data)->save();

        $this->auditLogService->log(
            action: 'service_fee.setting_updated',
            auditable: $setting,
            business: $business,
            oldValues: $oldValues,
            newValues: $setting->only(['fee_rate', 'is_active', 'terms', 'effective_from']),
            user: $user,
        );

        return $setting->refresh();
    }

    private function filteredQuery(array $filters)
    {
        return ServiceFee::query()
            ->with(['payment.sale', 'payment.customer'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['from'] ?? null, fn ($query, $from) => $query->whereDate('created_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, $to) => $query->whereDate('created_at', '<=', $to))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($searchQuery) => $searchQuery
                ->where('fee_amount', 'like', '%'.$search.'%')
                ->orWhere('payment_amount', 'like', '%'.$search.'%')
                ->orWhereHas('payment', fn ($paymentQuery) => $paymentQuery
                    ->where('payment_number', 'like', '%'.$search.'%')
                    ->orWhere('reference', 'like', '%'.$search.'%'))
                ->orWhereHas('payment.sale', fn ($saleQuery) => $saleQuery->where('invoice_number', 'like', '%'.$search.'%'))
                ->orWhereHas('business', fn ($businessQuery) => $businessQuery->where('business_name', 'like', '%'.$search.'%'))));
    }
}
