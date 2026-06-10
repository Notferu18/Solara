import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function MenuManager() {
  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [search,     setSearch]     = useState('');
  const [form,       setForm]       = useState({
    name: '', category_id: '', price: '', description: '', stock_quantity: '', is_available: true
  });

  useEffect(() => { fetchItems(); fetchCategories(); }, []);

  const fetchItems = async () => {
    try { const res = await api.get('/menu-items'); setItems(res.data); } catch {}
    setLoading(false);
  };

  const fetchCategories = async () => {
    try { const res = await api.get('/categories'); setCategories(res.data); } catch {}
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', category_id: '', price: '', description: '', stock_quantity: '', is_available: true });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name:           item.name,
      category_id:    item.category_id,
      price:          item.price,
      description:    item.description ?? '',
      stock_quantity: item.stock_quantity,
      is_available:   item.is_available,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/menu-items/${editItem.id}`, form);
      } else {
        await api.post('/menu-items', form);
      }
      setShowForm(false);
      fetchItems();
    } catch { alert('Failed to save item.'); }
  };

  const toggleAvailability = async (item) => {
    try {
      await api.put(`/menu-items/${item.id}`, { ...item, is_available: !item.is_available });
      fetchItems();
    } catch {}
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await api.delete(`/menu-items/${id}`); fetchItems(); } catch {}
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <input
          type="text" placeholder="Search menu items..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
        <button onClick={openAdd} className="btn-primary">+ Add Item</button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-solara-dark text-white">
            <tr>
              {['Item', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No items found</td></tr>
            ) : filtered.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-solara-light'}>
                <td className="px-4 py-3 font-semibold text-solara-dark">{item.name}</td>
                <td className="px-4 py-3 text-gray-500">{item.category?.name}</td>
                <td className="px-4 py-3 text-solara-brown font-bold">
                  ₱{Number(item.price).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${item.stock_quantity < 10 ? 'text-red-500' : 'text-green-600'}`}>
                    {item.stock_quantity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleAvailability(item)}
                    className={`text-xs font-bold px-2 py-1 rounded-full ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.is_available ? '✅ Available' : '❌ Unavailable'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)}
                      className="text-xs bg-solara-cream text-solara-dark px-2 py-1 rounded hover:bg-solara-brown hover:text-white transition-colors font-semibold">
                      ✏️ Edit
                    </button>
                    <button onClick={() => deleteItem(item.id)}
                      className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition-colors font-semibold">
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-solara-dark font-georgia mb-4">
              {editItem ? '✏️ Edit Item' : '+ Add New Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-solara-dark mb-1">
                  Item Name
                </label>
                <input className="input-field" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-solara-dark mb-1">
                  Category
                </label>
                <select className="input-field" value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-solara-dark mb-1">
                    Price (₱)
                  </label>
                  <input type="number" step="0.01" className="input-field" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-solara-dark mb-1">
                    Stock Qty
                  </label>
                  <input type="number" className="input-field" value={form.stock_quantity}
                    onChange={e => setForm({ ...form, stock_quantity: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-solara-dark mb-1">
                  Description
                </label>
                <textarea className="input-field" rows={2} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="avail" checked={form.is_available}
                  onChange={e => setForm({ ...form, is_available: e.target.checked })} />
                <label htmlFor="avail" className="text-sm text-solara-dark font-semibold">
                  Available for ordering
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editItem ? 'Save Changes' : 'Add Item'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}