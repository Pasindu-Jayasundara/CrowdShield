import { useQuery } from 'convex/react';
import { motion } from 'motion/react';
import { Activity, CreditCard, Server, Users } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import { MetricCard } from '../../components/MetricCard';
import { getSessionToken } from '../../utils/sessionToken';

export function AdminDashboard() {
  const sessionToken = getSessionToken() ?? undefined;
  const stats = useQuery(api.admin.dashboardStats, { sessionToken });

  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-text-muted">System health and platform overview</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Users"
          value={stats ? stats.totalUsers.toLocaleString() : '—'}
          icon={Users}
        />
        <MetricCard
          label="Active Subscriptions"
          value={stats ? String(stats.activeSubscriptions) : '—'}
          change={stats ? `MRR $${stats.mrr.toLocaleString()}` : undefined}
          icon={CreditCard}
        />
        <MetricCard label="API Health" value="Operational" icon={Activity} />
        <MetricCard label="Pending Reports" value={stats ? String(stats.pendingReports) : '—'} icon={Server} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {stats &&
          [
            { label: 'Database', value: stats.resourceUsage.database, color: 'bg-accent' },
            { label: 'AI Processing', value: stats.resourceUsage.aiProcessing, color: 'bg-primary' },
            { label: 'Storage', value: stats.resourceUsage.storage, color: 'bg-medium' },
          ].map((m) => (
            <div key={m.label} className="glass rounded-xl p-5">
              <motion.div className="flex justify-between text-sm">
                <span>{m.label}</span>
                <span className="font-semibold">{m.value}%</span>
              </motion.div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-elevated">
                <motion.div
                  className={`h-full ${m.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          ))}
      </div>
      {stats && stats.pastDueSubscriptions > 0 && (
        <div className="mt-6 glass rounded-xl border-l-4 border-critical p-4">
          <p className="font-semibold text-critical">Critical Alert</p>
          <p className="mt-1 text-sm text-text-muted">
            {stats.pastDueSubscriptions} subscription{stats.pastDueSubscriptions === 1 ? '' : 's'}{' '}
            past due — payment retry recommended
          </p>
        </div>
      )}
    </motion.div>
  );
}
