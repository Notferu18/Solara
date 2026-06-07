import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MenuManager from './MenuManager';
import InventoryPanel from './InventoryPanel';
import UserManager from './UserManager';
import ReportsPanel from './ReportsPanel';
import ForecastWidget from './ForecastWidget';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'menu',      label: 'Menu',      icon: '🍽️' },
  { key: 'inventory', label: 'Inventory', icon: '📦' },
  { key: 'users',     label: 'Users',     icon: '👥' },
  { key: 'reports',   label: 'Reports',   icon: '📈' },
  { key: 'forecast',  label: 'Forecast',  icon: '🤖' }, 
];

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
              onClick={() => setActivePage(item.key)}
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

// ── Dashboard Home (summary cards + placeholder charts) ───────
function DashboardHome() {
  const stats = [
    { label: 'Total Orders Today', value: '0',    icon: '🧾', color: 'bg-amber-50  border-amber-200' },
    { label: 'Revenue Today',      value: '₱0',   icon: '💰', color: 'bg-green-50  border-green-200' },
    { label: 'Menu Items',         value: '0',    icon: '🍽️', color: 'bg-blue-50   border-blue-200'  },
    { label: 'Low Stock Items',    value: '0',    icon: '⚠️', color: 'bg-red-50    border-red-200'   },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`card border ${s.color} flex items-center gap-4`}>
            <div className="text-4xl">{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-solara-dark">{s.value}</p>
              <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-solara-dark mb-4">📊 Sales This Week</h3>
          <div className="h-48 bg-solara-light rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Chart will appear after backend is connected
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-solara-dark mb-4">🏆 Top Selling Items</h3>
          <div className="h-48 bg-solara-light rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Chart will appear after backend is connected
          </div>
        </div>
      </div>

      {/* Recent orders placeholder */}
      <div className="card">
        <h3 className="font-bold text-solara-dark mb-4">🧾 Recent Orders</h3>
        <div className="text-center py-8 text-gray-400 text-sm">
          No orders yet — connect the backend to load data
        </div>
      </div>
    </div>
  );
}