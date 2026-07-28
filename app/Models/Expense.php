<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'business_id',
        'category_id',
        'amount',
        'description',
        'date',
    ];


    public function business()
    {
        return $this->belongsTo(Business::class);
    }


    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }
}