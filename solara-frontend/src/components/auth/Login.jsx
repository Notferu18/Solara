import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin')    navigate('/admin/dashboard');
      else if (user.role === 'staff')    navigate('/staff/pos');
      else if (user.role === 'customer') navigate('/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-solara-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">☕</div>
          <h1 className="text-4xl font-bold text-solara-dark font-georgia">SOLARA</h1>
          <p className="text-solara-brown italic text-lg">Coffee & Blooms</p>
          <p className="text-gray-500 text-sm mt-1">Cafe Management System</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-bold text-solara-dark mb-6 text-center">Sign In</h2>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-solara-dark mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@solara.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-solara-dark mb-1">
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-solara-cream"></div>
            <span className="px-3 text-gray-400 text-xs">or</span>
            <div className="flex-1 border-t border-solara-cream"></div>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500">
            No account yet?{' '}
            <a href="/register" className="text-solara-brown font-semibold hover:underline">
              Register here
            </a>
          </p>
        </div>

        {/* Test accounts hint */}
        <div className="mt-4 bg-solara-cream rounded-xl p-4 text-xs text-solara-dark space-y-1">
          <p className="font-bold mb-2">Test Accounts:</p>
          <p>Admin — admin@solara.com / 123</p>
          <p>Staff — staff@solara.com / 123</p>
          <p>Customer — lipra@solara.com / 123</p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2025 Solara Coffee & Blooms
        </p>
      </div>
    </div>
  );
}