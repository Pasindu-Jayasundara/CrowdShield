import { motion, AnimatePresence } from 'motion/react';
import { Loader2, LogIn, Shield, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
const DEMO_ACCOUNTS = [
  { label: 'Analyst', email: 'pro@security.io', password: 'analyst123', role: 'analyst' as const },
  { label: 'Admin', email: 'admin@crowdshield.com', password: 'admin123', role: 'admin' as const },
];

export function LoginModal({
  open,
  onClose,
  defaultRole,
}: {
  open: boolean;
  onClose: () => void;
  defaultRole?: 'analyst' | 'admin';
}) {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    defaultRole === 'admin' ? 'admin@crowdshield.com' : 'pro@security.io',
  );
  const [password, setPassword] = useState(
    defaultRole === 'admin' ? 'admin123' : 'analyst123',
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      onClose();
      navigate(user.role === 'admin' ? '/admin' : '/analyst');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close login"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-text-muted hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Staff Login</h2>
                <p className="text-sm text-text-muted">Analyst & admin dashboards</p>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-highlight/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-highlight/30"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-3 font-semibold disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                Sign in
              </button>
            </form>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-medium text-text-muted">Demo accounts</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => fillDemo(account)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                  >
                    {account.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
