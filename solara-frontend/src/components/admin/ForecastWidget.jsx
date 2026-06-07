import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function ForecastWidget() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { fetchForecast(); }, []);

  const fetchForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/forecast');
      setData(res.data);
    } catch {
      setError('Could not load forecast. Make sure the ML server is running.');
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
            Predicted order quantities using Random Forest Regressor (.pkl model)
          </p>
        </div>
        <button onClick={fetchForecast} className="btn-secondary text-sm">
          🔄 Refresh
        </button>
      </div>

      {/* ML Badge */}
      <div className="bg-solara-cream border border-solara-brown rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">🤖</span>
        <div>
          <p className="text-sm font-bold text-solara-dark">
            Supervised ML — Random Forest Regressor
          </p>
          <p className="text-xs text-gray-500">
            Model trained on historical sales data • Saved as model.pkl + scaler.pkl
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12 text-gray-400">
          Loading predictions...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          ⚠️ {error}
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
            <table className="w-full text-sm">
              <thead className="bg-solara-dark text-white">
                <tr>
                  {['Item', 'Category', 'Price', 'Avg Sales', 'Predicted Demand'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}