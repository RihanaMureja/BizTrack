<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'customer_id',
        'business_id',
        'cashier_id',
        'status',
        'payment_method',
        'total_amount',
    ];


    // Order belongs to one customer
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }


    // Order belongs to one business
    public function business()
    {
        return $this->belongsTo(Business::class);
    }


    // Order can be handled by a cashier (optional)
    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
    public function items()
  {
       return $this->hasMany(OrderItem::class);
  }
    public function sale()
 {
     return $this->hasOne(Sale::class);
 }
}