<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';
    case Partial = 'partial';
    case Unpaid = 'unpaid';
    case Overdue = 'overdue';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Completed => 'Completed',
            self::Failed => 'Failed',
            self::Partial => 'Partial',
            self::Unpaid => 'Unpaid',
            self::Overdue => 'Overdue',
        };
    }
}
