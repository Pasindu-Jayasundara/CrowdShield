import { motion } from 'motion/react';
import { CreditCard, Download, RefreshCw, X } from 'lucide-react';
import { MetricCard } from '../../components/MetricCard';
import { mockSubscriptions } from '../../data/mockData';

export function AdminSubscriptions() {
  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <button type="button" className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <MetricCard label="Active" value="847" icon={CreditCard} />
          <MetricCard label="MRR" value="$38,403" icon={CreditCard} />
          <MetricCard label="Past Due" value="4" change="Retry needed" icon={CreditCard} trend="up" />
          <MetricCard label="Churn Rate" value="12.5%" icon={CreditCard} />
        </div>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Next Billing</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockSubscriptions.map((s) => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="px-4 py-3">{s.userEmail}</td>
                  <td className="px-4 py-3 capitalize">{s.plan}</td>
                  <td className="px-4 py-3">${s.amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        s.status === 'active'
                          ? 'text-accent'
                          : s.status === 'past_due'
                            ? 'text-critical'
                            : 'text-text-dim'
                      }
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{s.nextBilling}</td>
                  <td className="px-4 py-3">
                    <motion.div className="flex gap-2">
                      {s.status === 'past_due' && (
                        <button type="button" className="text-primary" title="Retry payment">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                      <button type="button" className="text-critical" title="Cancel">
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
