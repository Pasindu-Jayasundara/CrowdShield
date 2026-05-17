import { useMutation } from 'convex/react';
import { motion } from 'motion/react';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setStatus('loading');
    setError(null);
    try {
      await subscribe({ email });
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Subscription failed');
    }
  };

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
          Get curated scam alerts and safety tips delivered to your inbox.
        </p>
        {status === 'success' ? (
          <motion.p
            className="mt-6 text-accent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            Subscribed! Check your inbox for confirmation.
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-on-primary hover:bg-primary-dim disabled:opacity-60"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && error && (
          <p className="mt-3 text-sm text-critical">{error}</p>
        )}
      </motion.div>
    </motion.section>
  );
}
