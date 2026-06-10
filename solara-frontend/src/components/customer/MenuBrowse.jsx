import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Cart from './Cart';
import OrderHistory from './OrderHistory';

export default function MenuBrowse() {
  const { user, logout }        = useAuth();
  const [menuItems, setMenuItems]       = useState([]);
  const [categories, setCategories]     = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart]                 = useState([]);
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('menu');

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu-items');
      setMenuItems(res.data);
    } catch {}
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories([{ id: 'all', name: 'All' }, ...res.data]);
    } catch {}
  };

  const filtered = menuItems.filter(item => {
    const matchCat    = activeCategory === 'All' || item.category?.name === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

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
            { key: 'menu',    icon: '🍽️', label: 'Menu'         },
            { key: 'cart',    icon: '🛒', label: `Cart (${cartCount})` },
            { key: 'history', icon: '📋', label: 'My Orders'    },
          ].map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-semibold transition-colors
                ${activeTab === item.key ? 'bg-solara-brown text-white' : 'text-solara-cream hover:bg-solara-brown hover:text-white'}`}>
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
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'menu' && (
          <>
            {/* Topbar */}
            <div className="bg-white border-b border-solara-cream px-6 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-solara-dark font-georgia">🍽️ Our Menu</h2>
                <button onClick={() => setActiveTab('cart')}
                  className="btn-primary text-sm relative">
                  🛒 Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field mb-3"
              />

              {/* Category filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.name)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                      ${activeCategory === cat.name ? 'bg-solara-brown text-white' : 'bg-solara-cream text-solara-dark hover:bg-solara-brown hover:text-white'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-6">
              {loading ? (
                <div className="text-center text-gray-400 py-12">Loading menu...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-gray-400 py-12">No items found</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map(item => (
                    <div key={item.id} className="card hover:shadow-lg hover:border-solara-brown transition-all duration-150">
                      {/* Item image placeholder */}
                      <div className="bg-solara-cream rounded-lg h-32 flex items-center justify-center text-5xl mb-3">
                        {item.category?.name === 'Coffee'   ? '☕' :
                         item.category?.name === 'Meals'    ? '🍱' :
                         item.category?.name === 'Snacks'   ? '🍟' :
                         item.category?.name === 'Tea'      ? '🍵' : '🥤'}
                      </div>
                      <p className="font-bold text-solara-dark text-sm leading-tight mb-1">{item.name}</p>
                      <p className="text-xs text-gray-400 mb-2">{item.category?.name}</p>
                      <p className="text-solara-brown font-bold text-lg mb-3">₱{Number(item.price).toFixed(2)}</p>
                      {item.is_available ? (
                        <button onClick={() => addToCart(item)} className="btn-primary w-full text-sm">
                          + Add to Cart
                        </button>
                      ) : (
                        <button disabled className="btn-secondary w-full text-sm opacity-50 cursor-not-allowed">
                          Unavailable
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'cart' && (
          <Cart
            cart={cart}
            setCart={setCart}
            onOrderPlaced={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && <OrderHistory />}
      </div>
    </div>
  );
}