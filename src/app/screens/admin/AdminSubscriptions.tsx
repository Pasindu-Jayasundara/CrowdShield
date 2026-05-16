import { useMutation, useQuery } from 'convex/react';
import { motion } from 'motion/react';
import { CreditCard, Download, RefreshCw, X } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { MetricCard } from '../../components/MetricCard';
import { toSubscription } from '../../utils/mapDoc';
import { getSessionToken } from '../../utils/sessionToken';

export function AdminSubscriptions() {
  const sessionToken = getSessionToken() ?? undefined;
  const subscriptions = useQuery(api.subscriptions.list, { sessionToken });
  const stats = useQuery(api.subscriptions.stats, { sessionToken });
  const updateStatus = useMutation(api.subscriptions.updateStatus);

  const handleCancel = async (id: Id<'subscriptions'>) => {
    await updateStatus({ sessionToken, subscriptionId: id, status: 'cancelled' });
  };

  const handleRetry = async (id: Id<'subscriptions'>) => {
    await updateStatus({ sessionToken, subscriptionId: id, status: 'active' });
  };

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
          <MetricCard label="Active" value={stats ? String(stats.activeCount) : '—'} icon={CreditCard} />
          <MetricCard
            label="MRR"
            value={stats ? `$${stats.mrr.toLocaleString()}` : '—'}
            icon={CreditCard}
          />
          <MetricCard
            label="Past Due"
            value={stats ? String(stats.pastDueCount) : '—'}
            change="Retry needed"
            icon={CreditCard}
            trend="up"
          />
          <MetricCard label="Churn Rate" value={stats ? `${stats.churnRate}%` : '—'} icon={CreditCard} />
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
              {subscriptions?.map((s) => {
                const sub = toSubscription(s);
                return (
                  <tr key={sub.id} className="border-b border-border/50">
                    <td className="px-4 py-3">{sub.userEmail}</td>
                    <td className="px-4 py-3 capitalize">{sub.plan}</td>
                    <td className="px-4 py-3">${sub.amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          sub.status === 'active'
                            ? 'text-accent'
                            : sub.status === 'past_due'
                              ? 'text-critical'
                              : 'text-text-dim'
                        }
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{sub.nextBilling}</td>
                    <td className="px-4 py-3">
                      <motion.div className="flex gap-2">
                        {sub.status === 'past_due' && (
                          <button
                            type="button"
                            onClick={() => handleRetry(sub.id as Id<'subscriptions'>)}
                            className="text-primary"
                            title="Retry payment"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCancel(sub.id as Id<'subscriptions'>)}
                          className="text-critical"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
