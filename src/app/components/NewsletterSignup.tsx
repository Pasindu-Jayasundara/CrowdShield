import { useMutation } from 'convex/react';
import { motion } from 'motion/react';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setStatus('loading');
    setError(null);
    try {
      await subscribe({ email, wantsCriticalAlerts: criticalAlerts });
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Subscription failed');
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm"
          />
          <label className="flex items-center gap-2 text-xs text-text-muted">
            <input
              type="checkbox"
              checked={criticalAlerts}
              onChange={(e) => setCriticalAlerts(e.target.checked)}
              className="accent-primary"
            />
            Email me critical threat alerts
          </label>
        </div>
        <button type="submit" disabled={status === 'loading'} className="btn-accent shrink-0 rounded-lg px-5 py-2.5">
          {status === 'loading' ? '…' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </button>
        {status === 'error' && error && <p className="text-xs text-critical sm:col-span-2">{error}</p>}
      </form>
    );
  }

  return (
    <motion.section
      className="glass rounded-2xl p-8 md:p-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.div className="mx-auto max-w-xl text-center">
        <Mail className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h2 className="text-2xl font-bold">Weekly Threat Digest</h2>
        <p className="mt-2 text-text-muted">
          Curated scam alerts, safety tips, and instant emails when critical threats are reported.
        </p>
        {status === 'success' ? (
          <motion.p className="mt-6 text-accent" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            Subscribed! You will receive the digest and critical alerts (if enabled).
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <label className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={criticalAlerts}
                onChange={(e) => setCriticalAlerts(e.target.checked)}
                className="accent-primary"
              />
              Alert me immediately for critical threats
            </label>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-on-primary hover:bg-primary-dim disabled:opacity-60"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && error && <p className="mt-3 text-sm text-critical">{error}</p>}
      </motion.div>
    </motion.section>
  );
}
