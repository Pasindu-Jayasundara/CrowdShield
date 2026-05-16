import { motion } from 'motion/react';
import { Activity, CreditCard, Server, Users } from 'lucide-react';
import { MetricCard } from '../../components/MetricCard';

export function AdminDashboard() {
  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-text-muted">System health and platform overview</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Users" value="15,293" icon={Users} />
          <MetricCard label="Active Subscriptions" value="847" change="MRR $38,403" icon={CreditCard} />
          <MetricCard label="API Health" value="Operational" icon={Activity} />
          <MetricCard label="Server Uptime" value="99.97%" icon={Server} />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[
            { label: 'Database', value: 94, color: 'bg-accent' },
            { label: 'AI Processing', value: 67, color: 'bg-primary' },
            { label: 'Storage', value: 42, color: 'bg-medium' },
          ].map((m) => (
            <div key={m.label} className="glass rounded-xl p-5">
              <div className="flex justify-between text-sm">
                <span>{m.label}</span>
                <span className="font-semibold">{m.value}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-elevated">
                <motion.div className={`h-full ${m.color}`} initial={{ width: 0 }} animate={{ width: `${m.value}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 glass rounded-xl border-l-4 border-critical p-4">
          <p className="font-semibold text-critical">Critical Alert</p>
          <p className="mt-1 text-sm text-text-muted">4 subscriptions past due — payment retry recommended</p>
        </div>
      </motion.div>
    </div>
  );
}
