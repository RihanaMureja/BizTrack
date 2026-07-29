<?php

namespace App\Observers;

use App\Models\Product;

class ProductObserver
{
    public function created(Product $product): void
    {
        $product->inventory()->firstOrCreate([], [
            'quantity' => 0,
            'available_stock' => 0,
            'updated_at' => now(),
        ]);
    }
}
