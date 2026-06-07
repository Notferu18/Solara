<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    protected $fillable = [
        'menu_item_id',
        'change_amount',
        'reason',
    ];

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}