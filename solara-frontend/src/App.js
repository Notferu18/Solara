import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from "./components/auth/Register";

// Admin
import AdminDashboard from './components/admin/AdminDashboard';
import KioskPage from './components/kiosk/KioskPage';

// Staff
import POSInterface from './components/staff/POSInterface';

// Customer
import MenuBrowse from './components/customer/MenuBrowse';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-solara-brown text-xl">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-solara-brown text-xl">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin')    return <Navigate to="/admin/dashboard" />;
  if (user.role === 'staff')    return <Navigate to="/staff/pos" />;
  if (user.role === 'customer') return <Navigate to="/menu" />;
  return <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/kiosk" element={<KioskPage />} />
        {/* Role redirect from root */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/inventory" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/forecast" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Staff */}
        <Route path="/staff/pos" element={
          <ProtectedRoute roles={['staff']}>
            <POSInterface />
          </ProtectedRoute>
        } />

        {/* Customer */}
        <Route path="/menu" element={
          <ProtectedRoute roles={['customer']}>
            <MenuBrowse />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}