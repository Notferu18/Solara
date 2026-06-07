import { useState } from 'react';
import api from '../../services/api';

export default function Cart({ cart, setCart, onOrderPlaced }) {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [submitting,    setSubmitting]    = useState(false);
  const [success,       setSuccess]       = useState('');
  const [error,         setError]         = useState('');

  const updateQty = (id, qty) => {
    if (qty < 1) return setCart(prev => prev.filter(c => c.id !== id));
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  };

  const removeItem = (id) => setCart(prev => prev.filter(c => c.id !== id));

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/orders', {
        items: cart.map(c => ({ menu_item_id: c.id, quantity: c.qty })),
        payment_method: paymentMethod,
      });
      setCart([]);
      setSuccess('✅ Order placed! We are preparing your order.');
      setTimeout(() => { setSuccess(''); onOrderPlaced(); }, 2500);
    } catch {
      setError('Failed to place order. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-solara-dark font-georgia mb-6">🛒 Your Cart</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-semibold text-center">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-400">Your cart is empty</p>
          <p className="text-gray-300 text-sm mt-1">Go to Menu to add items</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="card mb-4 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 pb-3 border-b border-solara-cream last:border-0 last:pb-0">
                <div className="text-3xl">☕</div>
                <div className="flex-1">
                  <p className="font-semibold text-solara-dark text-sm">{item.name}</p>
                  <p className="text-solara-brown text-sm">₱{Number(item.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 bg-solara-cream rounded-full text-solara-dark font-bold hover:bg-solara-brown hover:text-white transition-colors">−</button>
                  <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 bg-solara-cream rounded-full text-solara-dark font-bold hover:bg-solara-brown hover:text-white transition-colors">+</button>
                </div>
                <p className="text-sm font-bold text-solara-dark w-16 text-right">
                  ₱{(item.price * item.qty).toFixed(2)}
                </p>
                <button onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 font-bold text-sm">✕</button>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div className="card mb-4">
            <p className="font-bold text-solara-dark mb-3 text-sm">💳 Payment Method</p>
            <div className="flex gap-3">
              {['Cash', 'GCash'].map(method => (
                <button key={method} onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors
                    ${paymentMethod === method ? 'border-solara-brown bg-solara-brown text-white' : 'border-solara-cream bg-solara-light text-solara-dark hover:border-solara-brown'}`}>
                  {method === 'Cash' ? '💵' : '📱'} {method}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="card mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Subtotal ({cart.reduce((s, c) => s + c.qty, 0)} items)</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-solara-dark text-lg border-t border-solara-cream pt-3">
              <span>Total</span>
              <span className="text-solara-brown">₱{total.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={placeOrder} disabled={submitting}
            className="btn-primary w-full text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Placing Order...' : `Place Order • ₱${total.toFixed(2)}`}
          </button>
        </>
      )}
    </div>
  );
}