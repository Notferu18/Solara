import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function OrderHistory() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data);
    } catch {}
    setLoading(false);
  };

  const statusColors = {
    pending:   'badge-pending',
    preparing: 'badge-preparing',
    ready:     'badge-ready',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-solara-dark font-georgia">📋 My Orders</h2>
        <button onClick={fetchOrders} className="btn-secondary text-sm">🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-400">No orders yet</p>
          <p className="text-gray-300 text-sm mt-1">Place an order from the menu!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-solara-dark">Order #{order.order_number}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span className={statusColors[order.status] ?? 'badge-pending'}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                {order.order_items?.map((oi, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{oi.menu_item?.name} × {oi.quantity}</span>
                    <span className="text-solara-brown font-semibold">₱{Number(oi.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-solara-cream">
                <span className="text-xs text-gray-400">💳 {order.payment_method}</span>
                <span className="font-bold text-solara-dark">Total: ₱{Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}