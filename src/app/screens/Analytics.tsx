import { useQuery } from 'convex/react';
import { motion } from 'motion/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../../../convex/_generated/api';

const COLORS = ['#2D7DD2', '#00B894', '#4B9EFF', '#F5A623', '#E84040', '#22C55E'];

const chartTooltipStyle = {
  background: '#FFFFFF',
  border: '1px solid #E1E4E8',
  borderRadius: '8px',
  color: '#1A202C',
};
const chartGridStroke = '#E1E4E8';
const chartAxisStroke = '#6B7A9E';

export function Analytics() {
  const chartData = useQuery(api.analytics.chartData);

  const volumeChartData = chartData?.volumeChartData ?? [];
  const scamTypeData = chartData?.scamTypeData ?? [];
  const regionData = chartData?.regionData ?? [];

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-text-muted">Threat volume, distribution, and regional breakdown</p>
          </div>
          <button type="button" className="rounded-lg border border-primary px-4 py-2 text-sm text-primary hover:bg-primary/10">
            Export CSV
          </button>
        </div>

        {chartData === undefined ? (
          <p className="mt-8 text-sm text-text-muted">Loading analytics...</p>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="glass rounded-xl p-5">
              <h2 className="mb-4 text-sm font-semibold">Report Volume (7 days)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={volumeChartData}>
                  <CartesianGrid stroke={chartGridStroke} />
                  <XAxis dataKey="date" stroke={chartAxisStroke} fontSize={12} />
                  <YAxis stroke={chartAxisStroke} fontSize={12} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="reports" stroke="#2D7DD2" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass rounded-xl p-5">
              <h2 className="mb-4 text-sm font-semibold">Scam Type Distribution</h2>
              {scamTypeData.length === 0 ? (
                <p className="text-sm text-text-muted">No report data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={scamTypeData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                      {scamTypeData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="glass rounded-xl p-5 lg:col-span-2">
              <h2 className="mb-4 text-sm font-semibold">Reports by Region</h2>
              {regionData.length === 0 ? (
                <p className="text-sm text-text-muted">No regional data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={regionData}>
                    <CartesianGrid stroke={chartGridStroke} />
                    <XAxis dataKey="region" stroke={chartAxisStroke} fontSize={12} />
                    <YAxis stroke={chartAxisStroke} fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" fill="#2D7DD2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
