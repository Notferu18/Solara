import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function ReportsPanel() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [period,    setPeriod]    = useState('weekly');
  const [hovered,   setHovered]   = useState('weekly');
  const chartData = data?.chart_data ?? data?.chartData ?? [];
  const topItems = data?.top_items ?? data?.topItems ?? [];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchReports(); }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/sales?period=${period}`);
      console.log('Reports API response:', res.data);
      setData(res.data);
    } catch (err) {
      console.error('Reports fetch error:', err.response?.data || err.message);
      setData(null);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {['daily', 'weekly', 'monthly'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            onMouseEnter={() => {
              setHovered(p);
              setPeriod(p);
            }}
            onMouseLeave={() => setHovered(period)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors duration-150 ease-out
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
          <div className="rounded-lg border border-solara-cream bg-white p-3 text-sm text-solara-dark/80">
            Report totals use <strong>completed orders</strong> within the selected period.
          </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue',    value: `₱${Number(data.total_revenue ?? 0).toFixed(2)}`,  icon: '💰' },
              { label: 'Total Orders',     value: data.total_orders ?? 0,                             icon: '🧾' },
              { label: 'Avg Order Value',  value: `₱${Number(data.avg_order_value ?? 0).toFixed(2)}`, icon: '📊' },
            ].map((s, i) => (
              <div key={i} className="card group flex items-center gap-4 border border-solara-cream bg-solara-cream transition duration-150 ease-out hover:border-solara-brown hover:bg-solara-brown/5 hover:shadow-lg">
                <div className="text-4xl transition-colors duration-150 group-hover:text-solara-brown">{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-solara-dark transition-colors duration-150 group-hover:text-solara-brown">{s.value}</p>
                  <p className="text-xs text-gray-500 font-semibold">{s.label} ({hovered})</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart — Sales Over Time */}
          {chartData.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-solara-dark mb-4">📊 Revenue Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => `₱${val}`} />
                  <Bar dataKey="revenue" fill="#5C3317" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Items Bar Chart */}
          {topItems.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-solara-dark mb-4">🏆 Top Selling Items</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topItems} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                    <Legend />
                    <Bar dataKey="total_sold" fill="#B8860B" radius={[4, 4, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}