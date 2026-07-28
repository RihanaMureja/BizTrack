<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    protected $fillable = [
        'owner_id',
        'business_name',
        'business_type',
        'phone',
        'email',
        'address',
        'logo',
        'status',
    ];


    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }


    public function categories()
    {
        return $this->hasMany(Category::class);
    }


    public function products()
    {
        return $this->hasMany(Product::class);
    }


    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}