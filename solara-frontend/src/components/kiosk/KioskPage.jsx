import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function KioskPage() {
  const [step,           setStep]          = useState('menu');
  const [menuItems,      setMenuItems]     = useState([]);
  const [categories,     setCategories]    = useState([]);
  const [activeCategory, setActiveCategory]= useState('All');
  const [cart,           setCart]          = useState([]);
  const [search,         setSearch]        = useState('');
  const [queueNum,       setQueueNum]      = useState('');
  const [loading,        setLoading]       = useState(true);
  const [submitting,     setSubmitting]    = useState(false);
  const [payment,        setPayment]       = useState('Cash');
  const [error,          setError]         = useState('');
  const [refreshing,     setRefreshing]    = useState(false);

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:8000/api/menu-items/public');
      setMenuItems(res.data);
    } catch (err) {
      console.error('Menu fetch error:', err);
      setError('Could not load menu. Please refresh or try again later.');
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/categories/public');
      setCategories([{ id: 'all', name: 'All' }, ...res.data]);
    } catch (err) {
      console.error('Categories fetch error:', err);
      setError('Could not load categories. Category filters may be incomplete.');
    }
  };

  const filtered = menuItems.filter(item => {
    const matchCat    = activeCategory === 'All' || item.category?.name === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && item.is_available;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) setCart(prev => prev.filter(c => c.id !== id));
    else setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  };

  const total     = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/api/orders/kiosk', {
        items:          cart.map(c => ({ menu_item_id: c.id, quantity: c.qty })),
        payment_method: payment,
      });
      setQueueNum(res.data.queue_number);
      setCart([]);
      setStep('success');
    } catch (err) {
      console.error('Order error:', err);
      const message = err.response?.data?.message || err.message || 'Failed to place order. Please try again.';
      setError(message);
    }
    setSubmitting(false);
  };

  const resetKiosk = () => {
    setStep('menu');
    setCart([]);
    setQueueNum('');
    setSearch('');
    setActiveCategory('All');
    setError('');
  };

  const categoryIcons = {
    'Coffee':           '☕',
    'Non-Coffee & Tea': '🍵',
    'Meals':            '🍱',
    'Snacks':           '🍟',
    'All':              '🍽️',
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-solara-dark flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-8xl mb-6">✅</div>
          <h1 className="text-white text-4xl font-bold font-georgia mb-2">
            Order Placed!
          </h1>
          <p className="text-solara-cream text-lg mb-8">
            Please wait for your number to be called
          </p>
          <div className="bg-solara-brown rounded-3xl px-16 py-10 mb-8 inline-block">
            <p className="text-solara-cream text-sm font-semibold mb-2 tracking-widest uppercase">
              Your Queue Number
            </p>
            <p className="text-white font-bold" style={{ fontSize: '6rem', lineHeight: 1 }}>
              {queueNum}
            </p>
          </div>
          <div className="text-solara-cream text-sm mb-10">
            ☕ Sit back and relax — we'll call your number when ready!
          </div>
          <button onClick={resetKiosk}
            className="bg-solara-gold text-white font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-opacity">
            New Order
          </button>
        </div>
      </div>
    );
  }

  // ── REVIEW SCREEN ───────────────────────────────────────────
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-solara-light">
        <div className="bg-solara-dark px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">☕</span>
            <div>
              <h1 className="text-white font-bold text-xl font-georgia">SOLARA</h1>
              <p className="text-solara-cream text-xs italic">Coffee & Blooms</p>
            </div>
          </div>
          <button onClick={() => setStep('menu')}
            className="text-solara-cream hover:text-white text-sm font-semibold border border-solara-cream px-4 py-2 rounded-lg">
            ← Back to Menu
          </button>
        </div>

        <div className="max-w-2xl mx-auto p-8">
          <h2 className="text-2xl font-bold text-solara-dark font-georgia mb-6">
            🛒 Review Your Order
          </h2>

          <div className="card mb-6 space-y-3">
            {cart.map(item => (
              <div key={item.id}
                className="flex items-center gap-4 pb-3 border-b border-solara-cream last:border-0 last:pb-0">
                <div className="text-3xl">{categoryIcons[item.category?.name] ?? '☕'}</div>
                <div className="flex-1">
                  <p className="font-semibold text-solara-dark">{item.name}</p>
                  <p className="text-solara-brown text-sm">₱{Number(item.price).toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-8 h-8 bg-solara-cream rounded-full text-solara-dark font-bold hover:bg-solara-brown hover:text-white transition-colors">−</button>
                  <span className="w-8 text-center font-bold text-lg">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-8 h-8 bg-solara-cream rounded-full text-solara-dark font-bold hover:bg-solara-brown hover:text-white transition-colors">+</button>
                </div>
                <p className="w-20 text-right font-bold text-solara-dark">
                  ₱{(item.price * item.qty).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="card mb-6">
            <p className="font-bold text-solara-dark mb-3">💳 Payment Method</p>
            <div className="flex gap-3">
              {['Cash', 'GCash'].map(m => (
                <button key={m} onClick={() => setPayment(m)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-colors
                    ${payment === m
                      ? 'border-solara-brown bg-solara-brown text-white'
                      : 'border-solara-cream bg-white text-solara-dark hover:border-solara-brown'}`}>
                  {m === 'Cash' ? '💵' : '📱'} {m}
                </button>
              ))}
            </div>
          </div>

          <div className="card mb-6">
            <div className="flex justify-between text-gray-500 text-sm mb-2">
              <span>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t border-solara-cream pt-3">
              <span className="text-solara-dark">Total</span>
              <span className="text-solara-brown">₱{total.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={placeOrder} disabled={submitting}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50">
            {submitting ? 'Placing Order...' : `✅ Confirm Order • ₱${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    );
  }

  const refreshMenu = async () => {
    setRefreshing(true);
    await fetchMenu();
    await fetchCategories();
    setRefreshing(false);
  };

  // ── MENU SCREEN ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-solara-light">
      <div className="bg-solara-dark px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">☕</span>
          <div>
            <h1 className="text-white font-bold text-xl font-georgia">SOLARA</h1>
            <p className="text-solara-cream text-xs italic">Coffee & Blooms</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refreshMenu}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-solara-cream bg-solara-cream/10 px-4 py-3 text-solara-cream text-sm font-semibold hover:bg-solara-cream/20 disabled:opacity-60 disabled:cursor-not-allowed">
            {refreshing ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : '🔄'}
            Refresh Menu
          </button>
          <Link to="/login" className="text-solara-cream text-sm font-semibold hover:text-white">
            Back to Login
          </Link>
          <button onClick={() => cart.length > 0 && setStep('review')}
            disabled={cart.length === 0}
            className="relative bg-solara-brown text-white font-bold px-6 py-3 rounded-xl hover:bg-solara-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            🛒 View Order
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-solara-cream px-8 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            placeholder="🔍 Search menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field max-w-md"
          />
          <div className="text-sm text-gray-500">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} available • {cartCount} in cart
          </div>
        </div>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white border-b border-solara-cream px-8 py-3 flex gap-2 overflow-x-auto">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.name)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors
              ${activeCategory === cat.name
                ? 'bg-solara-brown text-white'
                : 'bg-solara-cream text-solara-dark hover:bg-solara-brown hover:text-white'}`}>
            {categoryIcons[cat.name] ?? '🍽️'} {cat.name}
          </button>
        ))}
      </div>

      <div className="px-8 py-6">
        {loading ? (
          <div className="text-center text-gray-400 py-20 text-lg">Loading menu...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-lg">No items found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <div key={item.id}
                  className="card hover:shadow-lg hover:border-solara-brown transition-all duration-150 cursor-pointer"
                  onClick={() => addToCart(item)}>
                  <div className="bg-solara-cream rounded-xl h-28 flex items-center justify-center text-5xl mb-3">
                    {categoryIcons[item.category?.name] ?? '☕'}
                  </div>
                  <p className="font-bold text-solara-dark text-sm leading-tight mb-1">{item.name}</p>
                  <p className="text-xs text-gray-400 mb-2">{item.category?.name}</p>
                  <p className="text-solara-brown font-bold text-lg mb-3">
                    ₱{Number(item.price).toFixed(2)}
                  </p>
                  {inCart ? (
                    <div className="bg-solara-brown text-white text-xs font-bold px-3 py-1 rounded-full text-center">
                      ✅ In cart × {inCart.qty}
                    </div>
                  ) : (
                    <div className="bg-solara-cream text-solara-dark text-xs font-bold px-3 py-1 rounded-full text-center hover:bg-solara-brown hover:text-white transition-colors">
                      + Add
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button onClick={() => setStep('review')}
            className="bg-solara-brown text-white font-bold px-10 py-4 rounded-2xl shadow-2xl hover:bg-solara-dark transition-colors flex items-center gap-4 text-lg">
            <span>🛒 {cartCount} item{cartCount > 1 ? 's' : ''}</span>
            <span className="border-l border-solara-cream pl-4">₱{total.toFixed(2)}</span>
            <span>View Order →</span>
          </button>
        </div>
      )}
    </div>
  );
}