import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#5C3317', '#B8860B', '#8B4513', '#D2691E', '#A0522D'];

export default function ReportsPanel() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState('weekly');

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { fetchReports(); }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/sales?period=${period}`);
      setData(res.data);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {['daily', 'weekly', 'monthly'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors
              ${period === p ? 'bg-solara-brown text-white' : 'bg-solara-cream text-solara-dark hover:bg-solara-brown hover:text-white'}`}>
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading reports...</div>
      ) : !data ? (
        <div className="card text-center py-12 text-gray-400">No report data yet — connect the backend</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue',    value: `₱${Number(data.total_revenue ?? 0).toFixed(2)}`,  icon: '💰' },
              { label: 'Total Orders',     value: data.total_orders ?? 0,                             icon: '🧾' },
              { label: 'Avg Order Value',  value: `₱${Number(data.avg_order_value ?? 0).toFixed(2)}`, icon: '📊' },
            ].map((s, i) => (
              <div key={i} className="card flex items-center gap-4">
                <div className="text-4xl">{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-solara-dark">{s.value}</p>
                  <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart — Sales Over Time */}
          {data.chart_data?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-solara-dark mb-4">📊 Revenue Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.chart_data}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => `₱${val}`} />
                  <Bar dataKey="revenue" fill="#5C3317" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pie Chart — Top Items */}
          {data.top_items?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-solara-dark mb-4">🏆 Top Selling Items</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.top_items} dataKey="total_sold" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {data.top_items.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}