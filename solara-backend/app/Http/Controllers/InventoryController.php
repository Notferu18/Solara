<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MenuItem;
use App\Models\InventoryLog;

class InventoryController extends Controller
{
    public function index()
    {
        return response()->json(
            MenuItem::with('category')->get()
        );
    }

    public function restock(Request $request)
    {
        $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'amount'       => 'required|integer|min:1',
            'reason'       => 'required|string',
        ]);

        $item = MenuItem::findOrFail($request->menu_item_id);
        $item->increment('stock_quantity', $request->amount);

        InventoryLog::create([
            'menu_item_id'  => $request->menu_item_id,
            'change_amount' => $request->amount,
            'reason'        => $request->reason,
        ]);

        return response()->json(['message' => 'Restocked successfully.', 'item' => $item]);
    }
}