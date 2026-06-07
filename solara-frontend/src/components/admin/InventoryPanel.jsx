import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function InventoryPanel() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [restock, setRestock] = useState({ menu_item_id: '', amount: '', reason: '' });
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try { const res = await api.get('/inventory'); setItems(res.data); } catch {}
    setLoading(false);
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/restock', restock);
      setRestock({ menu_item_id: '', amount: '', reason: '' });
      setSuccess('✅ Stock updated!');
      fetchInventory();
      setTimeout(() => setSuccess(''), 3000);
    } catch { alert('Failed to restock.'); }
  };

  const stockLevel = (qty) => {
    if (qty === 0)   return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    if (qty < 10)    return { label: 'Low Stock',    color: 'bg-yellow-100 text-yellow-700' };
    return               { label: 'In Stock',      color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="space-y-6">
      {/* Restock Form */}
      <div className="card">
        <h3 className="font-bold text-solara-dark mb-4">📦 Restock Item</h3>
        {success && <div className="text-green-600 text-sm font-semibold mb-3">{success}</div>}
        <form onSubmit={handleRestock} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-semibold text-solara-dark mb-1">Item</label>
            <select className="input-field" value={restock.menu_item_id}
              onChange={e => setRestock({ ...restock, menu_item_id: e.target.value })} required>
              <option value="">Select item</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-xs font-semibold text-solara-dark mb-1">Amount</label>
            <input type="number" className="input-field" placeholder="e.g. 50"
              value={restock.amount}
              onChange={e => setRestock({ ...restock, amount: e.target.value })} required />
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-semibold text-solara-dark mb-1">Reason</label>
            <input className="input-field" placeholder="e.g. Weekly restock"
              value={restock.reason}
              onChange={e => setRestock({ ...restock, reason: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary">+ Restock</button>
        </form>
      </div>

      {/* Inventory Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-solara-dark text-white">
            <tr>
              {['Item', 'Category', 'Price', 'Stock', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : items.map((item, i) => {
              const level = stockLevel(item.stock_quantity);
              return (
                <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-solara-light'}>
                  <td className="px-4 py-3 font-semibold text-solara-dark">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category?.name}</td>
                  <td className="px-4 py-3 text-solara-brown font-bold">₱{Number(item.price).toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-solara-dark">{item.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${level.color}`}>
                      {level.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}