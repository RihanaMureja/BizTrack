<?php

namespace App\Listeners;

use App\Events\InventoryLow;
use App\Enums\NotificationType;
use App\Notifications\LowStockNotification;
use App\Services\NotificationService;

class SendLowStockNotification
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function handle(InventoryLow $event): void
    {
        $inventory = $event->inventory->loadMissing('product.business.owner');
        $product = $inventory->product;
        $business = $product->business;
        $owner = $business->owner;
        if (! $owner) {
            return;
        }

        $existing = $this->notificationService->queryForUser($owner)
            ->where([
                'business_id' => $business->id,
                'user_id' => $owner?->id,
                'type' => NotificationType::LowStock->value,
                'title' => 'Low stock: '.$product->name,
                'is_read' => false,
            ])
            ->exists();

        if (! $existing) {
            $this->notificationService->create(
                $business,
                $owner,
                NotificationType::LowStock,
                'Low stock: '.$product->name,
                $product->name.' is at '.$inventory->available_stock.' available stock. Reorder level is '.$product->reorder_level.'.',
            );
        }

        $owner?->notify(new LowStockNotification($inventory));
    }
}
