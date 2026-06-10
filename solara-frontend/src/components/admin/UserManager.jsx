import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function UserManager() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success,  setSuccess]  = useState('');
  const [search,   setSearch]   = useState('');
  const [form,     setForm]     = useState({ name: '', email: '', password: '', role: 'staff' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err.response?.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'staff' });
      setSuccess('✅ User created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      const errors  = err.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat().join('\n')
        : err.response?.data?.message ?? 'Failed to create user.';
      alert(message);
    }
  };

  const roleColors = {
    admin:    'bg-purple-100 text-purple-700',
    staff:    'bg-blue-100   text-blue-700',
    customer: 'bg-green-100  text-green-700',
  };

  const roleIcons = { admin: '👑', staff: '🧑‍💼', customer: '🙋' };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const staffCount = users.filter(u => u.role === 'staff').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const customerCount = users.filter(u => u.role === 'customer').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-solara-dark">User Management</h2>
          <p className="text-sm text-gray-500">Create and manage staff accounts with fewer clicks.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2">
          + Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-solara-cream bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Users</div>
          <div className="text-2xl font-bold text-solara-dark">{users.length}</div>
        </div>
        <div className="rounded-2xl border border-solara-cream bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Staff</div>
          <div className="text-2xl font-bold text-solara-dark">{staffCount}</div>
        </div>
        <div className="rounded-2xl border border-solara-cream bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Admins</div>
          <div className="text-2xl font-bold text-solara-dark">{adminCount}</div>
        </div>
        <div className="rounded-2xl border border-solara-cream bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Customers</div>
          <div className="text-2xl font-bold text-solara-dark">{customerCount}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-full sm:w-80"
        />
        {success && (
          <div className="text-green-600 text-sm font-semibold">{success}</div>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-solara-dark text-white">
            <tr>
              {['Name', 'Email', 'Role', 'Joined'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  No users found
                </td>
              </tr>
            ) : filteredUsers.map((u, i) => (
              <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-solara-light'}>
                <td className="px-4 py-3 font-semibold text-solara-dark">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${roleColors[u.role]}`}>
                    {roleIcons[u.role]} {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-solara-dark font-georgia mb-4">
              + Add New Staff
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-solara-dark mb-1">
                  Full Name
                </label>
                <input className="input-field" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Lipra Qriz Abyan"
                  required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-solara-dark mb-1">
                  Email
                </label>
                <input type="email" className="input-field" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. lipra@solara.com"
                  required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-solara-dark mb-1">
                  Password <span className="text-gray-400 font-normal">(min. 6 characters)</span>
                </label>
                <input type="password" className="input-field" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  minLength={6}
                  required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-solara-dark mb-1">
                  Role
                </label>
                <select className="input-field" value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="staff">Staff / Cashier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Create User
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}