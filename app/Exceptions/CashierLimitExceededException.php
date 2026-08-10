<?php

namespace App\Exceptions;

use App\Models\Business;
use RuntimeException;

class CashierLimitExceededException extends RuntimeException
{
    public function __construct(
        private readonly Business $business,
        private readonly int $limit,
    ) {
        parent::__construct(
            'Your current subscription allows up to '.$limit.' cashier account(s).',
        );
    }

    public function business(): Business
    {
        return $this->business;
    }

    public function limit(): int
    {
        return $this->limit;
    }
}
