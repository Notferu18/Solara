import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function POSInterface() {
  const { user, logout } = useAuth();
  const [menuItems,      setMenuItems]      = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart,           setCart]           = useState([]);
  const [menuLoading,    setMenuLoading]    = useState(true);
  const [ordersLoading,  setOrdersLoading]  = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [success,        setSuccess]        = useState('');
  const [activeTab,      setActiveTab]      = useState('pos');
  const [orders,         setOrders]         = useState([]);

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  // ── Auto-refresh orders every 5 sec when on queue tab ──────
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchMenu = async () => {
    setMenuLoading(true);
    try {
      const res = await api.get('/menu-items');
      setMenuItems(res.data);
    } catch (err) {
      console.error('Menu fetch error:', err);
    }
    setMenuLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories([{ id: 'all', name: 'All' }, ...res.data]);
    } catch {}
  };

  // ── Uses queue endpoint ─────────────────────────────────────
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders/queue');
      setOrders(res.data);
    } catch (err) {
      console.error('Order queue fetch error:', err);
    }
    setOrdersLoading(false);
  };

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category?.name === activeCategory);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      await api.post('/orders', {
        items:          cart.map(c => ({ menu_item_id: c.id, quantity: c.qty })),
        payment_method: 'Cash',
      });
      setCart([]);
      setSuccess('✅ Order placed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      alert('Failed to place order. Check backend connection.');
    }
    setSubmitting(false);
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch {}
  };

  const statusColors = {
    pending:   'badge-pending',
    preparing: 'badge-preparing',
    ready:     'badge-ready',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  };

  const nextStatus = {
    pending:   'preparing',
    preparing: 'ready',
    ready:     'completed',
  };

  return (
    <div className="flex h-screen bg-solara-light overflow-hidden">

      {/* Sidebar */}
      <aside className="w-56 bg-solara-dark flex flex-col flex-shrink-0">
        <div className="px-6 py-6 border-b border-solara-brown text-center">
          <div className="text-3xl mb-1">☕</div>
          <h1 className="text-white font-bold text-lg font-georgia">SOLARA</h1>
          <p className="text-solara-cream text-xs italic">Coffee & Blooms</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {[
            { key: 'pos',    icon: '🧾', label: 'New Order'   },
            { key: 'orders', icon: '📋', label: 'Order Queue' },
          ].map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-semibold transition-colors
                ${activeTab === item.key
                  ? 'bg-solara-brown text-white'
                  : 'text-solara-cream hover:bg-solara-brown hover:text-white'}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-solara-brown">
          <div className="text-solara-cream text-xs mb-1 px-2">Logged in as</div>
          <div className="text-white text-sm font-bold px-2 mb-3 truncate">{user?.name}</div>
          <button onClick={logout}
            className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-300 hover:bg-red-900 hover:text-white transition-colors font-semibold">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'pos' ? (
          <>
            {/* Menu Grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-white border-b border-solara-cream px-6 py-4 sticky top-0 z-10">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-solara-dark font-georgia mb-3">🧾 New Order</h2>
                    <p className="text-sm text-gray-500">Select items, update quantities, then place the order.</p>
                  </div>
                  <button onClick={fetchMenu}
                    disabled={menuLoading}
                    className="btn-secondary text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {menuLoading ? <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : '🔄'}
                    Refresh Menu
                  </button>
                </div>
                <div className="mt-4 flex gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.name)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                        ${activeCategory === cat.name
                          ? 'bg-solara-brown text-white'
                          : 'bg-solara-cream text-solara-dark hover:bg-solara-brown hover:text-white'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {menuLoading ? (
                  <div className="text-center text-gray-400 py-12">Loading menu...</div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">No items found</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                      <button key={item.id} onClick={() => addToCart(item)}
                        disabled={!item.is_available}
                        className="card text-left hover:shadow-lg hover:border-solara-brown transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
                        <div className="text-3xl mb-2">☕</div>
                        <p className="font-bold text-solara-dark text-sm leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-400 mb-2">{item.category?.name}</p>
                        <p className="text-solara-brown font-bold">₱{Number(item.price).toFixed(2)}</p>
                        {!item.is_available && (
                          <p className="text-xs text-red-400 mt-1">Out of stock</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart */}
            <div className="w-80 bg-white border-l border-solara-cream flex flex-col flex-shrink-0">
              <div className="px-6 py-4 border-b border-solara-cream">
                <h3 className="font-bold text-solara-dark text-lg">🛒 Order Summary</h3>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-12">
                    No items yet — click menu items to add
                  </div>
                ) : cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-solara-light rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-solara-dark leading-tight">{item.name}</p>
                      <p className="text-xs text-solara-brown">₱{Number(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-6 h-6 bg-solara-cream rounded text-solara-dark font-bold text-sm hover:bg-solara-brown hover:text-white transition-colors">−</button>
                      <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-6 h-6 bg-solara-cream rounded text-solara-dark font-bold text-sm hover:bg-solara-brown hover:text-white transition-colors">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-solara-cream space-y-3">
                {success && (
                  <div className="text-green-600 text-sm font-semibold text-center">{success}</div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-solara-dark">Total</span>
                  <span className="text-xl font-bold text-solara-brown">₱{total.toFixed(2)}</span>
                </div>
                <button onClick={submitOrder} disabled={cart.length === 0 || submitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
                <button onClick={() => setCart([])} className="btn-secondary w-full text-sm">
                  Clear Cart
                </button>
              </div>
            </div>
          </>

        ) : (
          /* ── Order Queue ─────────────────────────────────── */
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-solara-dark font-georgia">
                  📋 Order Queue
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {ordersLoading ? 'Refreshing orders…' : '🔄 Auto-refreshes every 5 seconds'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-solara-cream px-3 py-1 text-xs font-semibold text-solara-dark">
                  {orders.length} active order{orders.length !== 1 ? 's' : ''}
                </div>
                <button onClick={fetchOrders}
                  disabled={ordersLoading}
                  className="btn-secondary text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {ordersLoading ? <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : '🔄'}
                  Refresh Now
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="card text-center text-gray-400 py-12">
                <div className="text-5xl mb-3">📋</div>
                <p>No active orders</p>
                <p className="text-xs mt-1">New kiosk orders will appear here automatically</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(order => (
                  <div key={order.id}
                    className={`card border-l-4 ${
                      order.status === 'pending'   ? 'border-yellow-400' :
                      order.status === 'preparing' ? 'border-blue-400'   :
                      order.status === 'ready'     ? 'border-green-400'  : 'border-gray-300'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {order.queue_number && (
                          <p className="text-3xl font-bold text-solara-brown font-georgia">
                            {order.queue_number}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {order.order_number} • {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.user ? order.user.name : '🖥️ Kiosk Order'}
                        </p>
                      </div>
                      <span className={statusColors[order.status]}>
                        {order.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      {order.order_items?.map((oi, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{oi.menu_item?.name} × {oi.quantity}</span>
                          <span className="text-solara-brown font-semibold">
                            ₱{Number(oi.subtotal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-solara-cream">
                      <span className="font-bold text-solara-dark">
                        ₱{Number(order.total_amount).toFixed(2)}
                      </span>
                      {nextStatus[order.status] && (
                        <button
                          onClick={() => updateStatus(order.id, nextStatus[order.status])}
                          className="btn-primary text-xs py-1 px-4">
                          Mark {nextStatus[order.status]} →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}