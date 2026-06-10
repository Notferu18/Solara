import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function ForecastWidget() {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [source,     setSource]     = useState('ml');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => { fetchForecast(); }, []);

  // Auto-refresh every 10 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchForecast, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/forecast');
      setData(res.data);
      const firstSource = Array.isArray(res.data) && res.data.length > 0 ? res.data[0].forecast_source : 'ml';
      setSource(firstSource);
      setLastUpdated(new Date());
    } catch {
      setError('Could not load forecast. Make sure the ML server is running.');
      setSource('fallback');
    }
    setLoading(false);
  };

  const top10 = [...data]
    .sort((a, b) => b.predicted_quantity - a.predicted_quantity)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-solara-dark text-lg font-georgia">
            🤖 Demand Forecast
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Predicted order quantities using Random Forest Regressor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300" />
            Auto-refresh
          </label>
          <button onClick={fetchForecast} disabled={loading}
            className="btn-secondary text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : '🔄'}
            {loading ? 'Fetching...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ML Badge */}
      <div className="bg-solara-cream border border-solara-brown rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-sm font-bold text-solara-dark">
              Supervised ML — Random Forest Regressor
            </p>
            <p className="text-xs text-gray-500">
              Model trained on historical sales data • Data quality: {data.length > 0 ? 'Good ✅' : 'Pending'}
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-600">
          <div>Source: <span className={`font-semibold ${source === 'ml' ? 'text-green-600' : 'text-orange-600'}`}>
            {source === 'ml' ? '🧠 ML Model' : '📊 Fallback'}
          </span></div>
          {lastUpdated && (
            <div className="mt-1 text-gray-500">
              Updated {Math.floor((Date.now() - lastUpdated.getTime()) / 1000) < 60 
                ? 'just now' 
                : `${Math.floor((Date.now() - lastUpdated.getTime()) / 60000)}m ago`}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="h-8 w-8 rounded-full border-4 border-solara-cream border-t-solara-brown animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading predictions...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={fetchForecast} className="btn-secondary text-xs py-1 px-3">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Bar Chart */}
          <div className="card">
            <h4 className="font-bold text-solara-dark mb-4">
              📊 Top 10 Predicted Demand (units)
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={top10} layout="vertical"
                margin={{ left: 120, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(val) => [`${val} units`, 'Predicted']} />
                <Bar dataKey="predicted_quantity" fill="#5C3317" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 bg-solara-light border-b border-solara-cream text-xs text-gray-600 font-semibold">
              💡 Tip: Use predicted demand to plan staffing and preparation timing.
            </div>
            <table className="w-full text-sm">
              <thead className="bg-solara-dark text-white">
                <tr>
                  {['Item', 'Category', 'Price', 'Avg Sales', 'Predicted Demand', 'Change'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => {
                  const change = item.predicted_quantity - item.avg_sales;
                  const changePercent = item.avg_sales > 0 ? ((change / item.avg_sales) * 100).toFixed(0) : 0;
                  return (
                    <tr key={item.id}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-solara-light'}>
                      <td className="px-4 py-3 font-semibold text-solara-dark">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.category}</td>
                      <td className="px-4 py-3 text-solara-brown font-bold">
                        ₱{Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.avg_sales} units</td>
                      <td className="px-4 py-3">
                        <span className="bg-solara-cream text-solara-dark font-bold
                                         px-2 py-1 rounded-full text-xs">
                          📦 {item.predicted_quantity} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(changePercent)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}