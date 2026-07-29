<?php

namespace App\Listeners;

use App\Events\BusinessRegistered;
use App\Events\SaleCompleted;
use App\Services\AuditLogService;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;

class CreateAuditLog
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function handle(object $event): void
    {
        match (true) {
            $event instanceof SaleCompleted => $this->recordSaleCompleted($event),
            $event instanceof Login => $this->recordLogin($event),
            $event instanceof Logout => $this->recordLogout($event),
            $event instanceof BusinessRegistered => $this->recordBusinessRegistered($event),
            default => null,
        };
    }

    private function recordSaleCompleted(SaleCompleted $event): void
    {
        $this->auditLogService->record(
            'sale_completed',
            'sales',
            $event->sale->id,
            null,
            $event->sale->only(['invoice_number', 'grand_total', 'status']),
            $event->sale->user,
        );
    }

    private function recordLogin(Login $event): void
    {
        $this->auditLogService->log(
            action: 'auth.login',
            user: $event->user,
            newValues: ['email' => $event->user->email],
        );
    }

    private function recordLogout(Logout $event): void
    {
        $this->auditLogService->log(
            action: 'auth.logout',
            user: $event->user,
            newValues: ['email' => $event->user?->email],
        );
    }

    private function recordBusinessRegistered(BusinessRegistered $event): void
    {
        $this->auditLogService->log(
            action: 'business.registered',
            auditable: $event->business,
            business: $event->business,
            user: $event->business->owner,
            newValues: $event->business->only(['business_name', 'business_type', 'email', 'status']),
        );
    }
}
