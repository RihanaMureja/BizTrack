<?php

namespace App\Enums;

enum SaleStatus: string
{
    case Completed = 'completed';
    case Draft = 'draft';
    case Cancelled = 'cancelled';
}
