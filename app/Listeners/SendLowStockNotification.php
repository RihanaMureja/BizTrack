<?php

namespace App\Listeners;

use App\Events\InventoryLow;
use App\Models\Notification;
use App\Notifications\LowStockNotification;

class SendLowStockNotification
{
    public function handle(InventoryLow $event): void
    {
        $inventory = $event->inventory->loadMissing('product.business.owner');
        $product = $inventory->product;
        $business = $product->business;
        $owner = $business->owner;

        Notification::firstOrCreate(
            [
                'business_id' => $business->id,
                'user_id' => $owner?->id,
                'type' => 'low_stock',
                'title' => 'Low stock: '.$product->name,
                'is_read' => false,
            ],
            [
                'message' => $product->name.' is at '.$inventory->available_stock.' available stock. Reorder level is '.$product->reorder_level.'.',
            ],
        );

        $owner?->notify(new LowStockNotification($inventory));
    }
}
