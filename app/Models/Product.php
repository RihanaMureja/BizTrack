<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'business_id',
        'category_id',
        'product_name',
        'sku',
        'buy_price',
        'sell_price',
        'quantity',
        'reorder_level',
        'status',
    ];


    public function business()
    {
        return $this->belongsTo(Business::class);
    }


    public function category()
    {
        return $this->belongsTo(Category::class);
    }


    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }


    public function isLowStock()
    {
        return $this->quantity <= $this->reorder_level;
    }
}