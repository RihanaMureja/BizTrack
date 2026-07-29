<?php

namespace App\Enums;

enum InventoryTransactionType: string
{
    case Restock = 'restock';
    case Adjustment = 'adjustment';
    case Damaged = 'damaged';
    case Return = 'return';
    case Sale = 'sale';

    public function label(): string
    {
        return match ($this) {
            self::Restock => 'Restock',
            self::Adjustment => 'Manual adjustment',
            self::Damaged => 'Damaged stock',
            self::Return => 'Returned stock',
            self::Sale => 'Sale reduction',
        };
    }
}
