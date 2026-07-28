<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'order_id',
        'total_amount',
        'profit',
    ];


    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}