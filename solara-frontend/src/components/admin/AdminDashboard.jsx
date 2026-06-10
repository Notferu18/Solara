import { useEffect, useState } from 'react'; 
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import MenuManager from './MenuManager';
import InventoryPanel from './InventoryPanel';
import UserManager from './UserManager';
import ReportsPanel from './ReportsPanel';
import ForecastWidget from './ForecastWidget';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  { key: 'menu',      label: 'Menu',      icon: '🍽️', path: '/admin/menu' },
  { key: 'inventory', label: 'Inventory', icon: '📦', path: '/admin/inventory' },
  { key: 'users',     label: 'Users',     icon: '👥', path: '/admin/users' },
  { key: 'reports',   label: 'Reports',   icon: '📈', path: '/admin/reports' },
  { key: 'forecast',  label: 'Forecast',  icon: '🤖', path: '/admin/forecast' }, 
];

  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes('/admin/menu'))      return 'menu';
    if (path.includes('/admin/inventory')) return 'inventory';
    if (path.includes('/admin/users'))     return 'users';
    if (path.includes('/admin/reports'))   return 'reports';
    if (path.includes('/admin/forecast'))  return 'forecast';
    return 'dashboard';
  };

  const activePage = getActivePage();

  const renderPage = () => {
    switch (activePage) {
      case 'menu':      return <MenuManager />;
      case 'inventory': return <InventoryPanel />;
      case 'users':     return <UserManager />;
      case 'reports':   return <ReportsPanel />;
      case 'forecast':  return <ForecastWidget />;
      default:          return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-solara-light overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-solara-dark flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-solara-brown">
          <div className="text-3xl text-center mb-1">☕</div>
          <h1 className="text-white font-bold text-xl text-center font-georgia">SOLARA</h1>
          <p className="text-solara-cream text-xs text-center italic">Coffee & Blooms</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-semibold transition-colors duration-150
                ${activePage === item.key
                  ? 'bg-solara-brown text-white'
                  : 'text-solara-cream hover:bg-solara-brown hover:text-white'}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-solara-brown">
          <div className="text-solara-cream text-xs mb-1 px-2">Logged in as</div>
          <div className="text-white text-sm font-bold px-2 mb-3 truncate">{user?.name}</div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-300 hover:bg-red-900 hover:text-white transition-colors duration-150 font-semibold"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="bg-white border-b border-solara-cream px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-solara-dark font-georgia capitalize">
            {navItems.find(n => n.key === activePage)?.icon} {navItems.find(n => n.key === activePage)?.label}
          </h2>
          <span className="text-sm text-gray-400">👑 Admin Panel</span>
        </div>

        <div className="p-8">
          {renderPage() }
        </div>
      </main>
    </div>
  );
}

// ── Dashboard Home (fetches live stats from backend, charts, and recent orders) ───────
function DashboardHome() {
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [topItems, setTopItems] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const navigate = useNavigate();

  // fetch once and then poll every 5s for faster refresh
  useEffect(() => {
    fetchDashboardStats();
    const id = setInterval(fetchDashboardStats, 5000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchDashboardStats();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [ordersRes, menuRes, reportsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/inventory'),
        api.get('/reports/sales?period=weekly'),
      ]);

      const orders = Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : (Array.isArray(ordersRes.data) ? ordersRes.data : []);
      const menuItems = Array.isArray(menuRes.data?.data) ? menuRes.data.data : (Array.isArray(menuRes.data) ? menuRes.data : []);
      const reports = reportsRes.data || {};

      // Count today's orders
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(o => o.created_at?.startsWith(today));
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

      // Count low stock items (match InventoryPanel logic: <10)
      const lowStock = menuItems.filter(m => {
        const qty = Number(m.stock_quantity ?? m.stock ?? m.quantity ?? 0);
        return !Number.isNaN(qty) && qty < 10;
      }).length;

      setStats([
        { label: 'Total Orders Today', value: todayOrders.length.toString(), icon: '🧾', color: 'bg-amber-50 border-amber-200' },
        { label: 'Revenue Today', value: `₱${todayRevenue.toFixed(2)}`, icon: '💰', color: 'bg-green-50 border-green-200' },
        { label: 'Menu Items', value: menuItems.length.toString(), icon: '🍽️', color: 'bg-blue-50 border-blue-200' },
        { label: 'Low Stock Items', value: lowStock.toString(), icon: '⚠️', color: 'bg-red-50 border-red-200' },
      ]);

      // Reports data for charts
      setChartData(Array.isArray(reports.chart_data) ? reports.chart_data : null);
      setTopItems(Array.isArray(reports.top_items) ? reports.top_items : null);

      // Recent orders (show latest 5)
      const recent = orders.slice().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5);
      setRecentOrders(recent);
      setLastUpdated(new Date());
      setLoading(false);

      // debug logs to help troubleshooting low-stock or API shape issues
      // eslint-disable-next-line no-console
      console.log('Dashboard fetch:', { orders: orders.length, menu: menuItems.length, reports });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Dashboard stats fetch error:', err?.response?.data || err.message || err);
      setStats([
        { label: 'Total Orders Today', value: '—', icon: '🧾', color: 'bg-amber-50 border-amber-200' },
        { label: 'Revenue Today', value: '—', icon: '💰', color: 'bg-green-50 border-green-200' },
        { label: 'Menu Items', value: '—', icon: '🍽️', color: 'bg-blue-50 border-blue-200' },
        { label: 'Low Stock Items', value: '—', icon: '⚠️', color: 'bg-red-50 border-red-200' },
      ]);
      setChartData(null);
      setTopItems(null);
      setRecentOrders([]);
      setLastUpdated(new Date());
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ''}</div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDashboardStats} className="px-3 py-1 bg-solara-cream text-solara-dark rounded-lg text-sm font-semibold">Refresh</button>
          {loading && <div className="text-sm text-gray-400">Loading…</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const clickable = s.label === 'Low Stock Items' || s.label === 'Menu Items';
          const to = s.label === 'Low Stock Items' ? '/admin/inventory' : (s.label === 'Menu Items' ? '/admin/menu' : null);
          return (
            <div
              key={i}
              role={clickable ? 'button' : undefined}
              onClick={() => clickable && navigate(to)}
              className={`card border ${s.color} flex items-center gap-4 p-4 hover:shadow-lg hover:-translate-y-1 transform transition-all duration-150 ${clickable ? 'cursor-pointer' : ''}`}
            >
              <div className="text-4xl">{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-solara-dark">{s.value}</p>
                <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-solara-dark mb-4">📊 Sales This Week</h3>
          {chartData && chartData.length > 0 ? (
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => `₱${val}`} />
                  <Bar dataKey="revenue" fill="#5C3317" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 bg-solara-light rounded-lg flex items-center justify-center text-gray-400 text-sm">No chart data yet</div>
          )}
        </div>

        <div className="card">
          <h3 className="font-bold text-solara-dark mb-4">🏆 Top Selling Items</h3>
          {topItems && topItems.length > 0 ? (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topItems} dataKey="total_sold" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {topItems.map((_, i) => <Cell key={i} fill={["#5C3317","#B8860B","#8B4513","#D2691E","#A0522D"][i % 5]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 bg-solara-light rounded-lg flex items-center justify-center text-gray-400 text-sm">No top-items data yet</div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <h3 className="font-bold text-solara-dark mb-4">🧾 Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No recent orders</div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map(o => (
              <div key={o.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <div className="font-semibold">{o.order_number ?? `#${o.id}`}</div>
                  <div className="text-xs text-gray-500">{o.user?.name ?? 'Guest'} · {new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="font-bold">₱{Number(o.total_amount).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}