import { useEffect, useState } from 'react'; 
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import MenuManager from './MenuManager';
import UserManager from './UserManager';
import ReportsPanel from './ReportsPanel';
import ForecastWidget from './ForecastWidget';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  { key: 'menu',      label: 'Menu',      icon: '🍽️', path: '/admin/menu' },
  { key: 'users',     label: 'Users',     icon: '👥', path: '/admin/users' },
  { key: 'reports',   label: 'Reports',   icon: '📈', path: '/admin/reports' },
  { key: 'forecast',  label: 'Forecast',  icon: '🤖', path: '/admin/forecast' }, 
];

  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes('/admin/menu'))      return 'menu';
    if (path.includes('/admin/users'))     return 'users';
    if (path.includes('/admin/reports'))   return 'reports';
    if (path.includes('/admin/forecast'))  return 'forecast';
    return 'dashboard';
  };

  const activePage = getActivePage();

  const renderPage = () => {
    switch (activePage) {
      case 'menu':      return <MenuManager />;
      case 'users':     return <UserManager />;
      case 'reports':   return <ReportsPanel />;
      case 'forecast':  return <ForecastWidget />;
      default:          return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-solara-light overflow-hidden">

      {/* Sidebar */}
      <aside className={`bg-solara-dark flex flex-col flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo */}
        <div className={`px-6 py-6 border-b border-solara-brown flex items-center justify-between ${sidebarCollapsed ? 'flex-col gap-2' : ''}`}>
          <div className={`text-center ${sidebarCollapsed ? 'w-full' : ''}`}>
            <div className="text-3xl mb-1">☕</div>
            {!sidebarCollapsed && (
              <>
                <h1 className="text-white font-bold text-xl font-georgia">SOLARA</h1>
                <p className="text-solara-cream text-xs italic">Coffee & Blooms</p>
              </>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            className="text-solara-cream hover:text-white transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <span className="text-xl">☰</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-semibold transition-colors duration-150 ${sidebarCollapsed ? 'justify-center' : ''}
                ${activePage === item.key
                  ? 'bg-solara-brown text-white'
                  : 'text-solara-cream hover:bg-solara-brown hover:text-white'}`}
            >
              <span>{item.icon}</span>
              <span className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-solara-brown">
          {!sidebarCollapsed && (
            <>
              <div className="text-solara-cream text-xs mb-1 px-2">Logged in as</div>
              <div className="text-white text-sm font-bold px-2 mb-3 truncate">{user?.name}</div>
            </>
          )}
          <button
            onClick={logout}
            className={`w-full ${sidebarCollapsed ? 'px-0 py-2' : 'px-4 py-2'} rounded-lg text-sm ${sidebarCollapsed ? 'text-white' : 'text-red-300'} hover:bg-red-900 hover:text-white transition-colors duration-150 font-semibold flex items-center justify-center`}
          >
            🚪 {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="bg-white border-b border-solara-cream px-8 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-solara-dark font-georgia capitalize">
              {navItems.find(n => n.key === activePage)?.icon} {navItems.find(n => n.key === activePage)?.label}
            </h2>
            <p className="text-sm text-gray-500">
              Welcome back, {user?.name}. 
            </p>
          </div>
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
    const id = setInterval(fetchDashboardStats, 8000);

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
        api.get('/menu-items'),
        api.get('/reports/sales?period=weekly'),
      ]);

      const orders = Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : (Array.isArray(ordersRes.data) ? ordersRes.data : []);
      const menuItems = Array.isArray(menuRes.data?.data) ? menuRes.data.data : (Array.isArray(menuRes.data) ? menuRes.data : []);
      const reports = reportsRes.data || {};

      // Count today's orders
      const today = new Date().toISOString().split('T')[0];
      const allTodayOrders = orders.filter(o => o.created_at?.startsWith(today));
      const completedTodayOrders = allTodayOrders.filter(o => o.status === 'completed');
      const todayRevenue = completedTodayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

      const pendingTodayOrders = allTodayOrders.filter(o => o.status !== 'completed').length;

      setStats([
        { label: 'All Orders Today', value: allTodayOrders.length.toString(), icon: '📦', color: 'bg-sky-50 border-sky-200' },
        { label: 'Completed Orders Today', value: completedTodayOrders.length.toString(), icon: '🧾', color: 'bg-amber-50 border-amber-200' },
        { label: 'Pending Orders Today', value: pendingTodayOrders.toString(), icon: '⌛', color: 'bg-purple-50 border-purple-200' },
        { label: 'Revenue Today', value: `₱${todayRevenue.toFixed(2)}`, icon: '💰', color: 'bg-green-50 border-green-200' },
        { label: 'Menu Items', value: menuItems.length.toString(), icon: '🍽️', color: 'bg-blue-50 border-blue-200' },
      ]);

      // Reports data for charts
      setChartData(Array.isArray(reports.chart_data) ? reports.chart_data : null);
      setTopItems(Array.isArray(reports.top_items) ? reports.top_items : null);

      // Recent orders (show latest 5)
      const recent = orders.slice().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5);
      setRecentOrders(recent);
      setLastUpdated(new Date());
      setLoading(false);

      // debug logs to help troubleshooting dashboard API shape issues
      // eslint-disable-next-line no-console
      console.log('Dashboard fetch:', { orders: orders.length, menu: menuItems.length, reports });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Dashboard stats fetch error:', err?.response?.data || err.message || err);
      setStats([
        { label: 'Total Orders Today', value: '—', icon: '🧾', color: 'bg-amber-50 border-amber-200' },
        { label: 'Revenue Today', value: '—', icon: '💰', color: 'bg-green-50 border-green-200' },
        { label: 'Menu Items', value: '—', icon: '🍽️', color: 'bg-blue-50 border-blue-200' },
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
          <button
            onClick={fetchDashboardStats}
            className="px-3 py-1 bg-solara-cream text-solara-dark rounded-lg text-sm font-semibold flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="h-4 w-4 rounded-full border-2 border-solara-dark border-t-transparent animate-spin" />
            ) : (
              <span>⟳</span>
            )}
            Refresh
          </button>
        </div>
      </div>
      <div className="rounded-lg border border-solara-cream bg-white p-3 text-sm text-solara-dark/80">
        Reports and dashboard totals are based on <strong>completed orders</strong> only, so pending orders will not count here.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const navMap = {
            'Menu Items': '/admin/menu',
            'All Orders Today': '/admin/reports',
            'Completed Orders Today': '/admin/reports',
            'Pending Orders Today': '/admin/reports',
            'Revenue Today': '/admin/reports',
          };
          const to = navMap[s.label] ?? null;
          const clickable = Boolean(to);
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
                <BarChart data={topItems} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => Number(val).toLocaleString()} />
                  <Bar dataKey="total_sold" fill="#B8860B" radius={[4,4,4,4]} />
                </BarChart>
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