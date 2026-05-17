import { useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import { useApp } from '../context/AppContext';

export function PaymentModal({
  open,
  onClose,
  plan,
  amount,
}: {
  open: boolean;
  onClose: () => void;
  plan: 'monthly' | 'annual';
  amount: number;
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  const checkout = useMutation(api.subscriptions.checkout);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid email for your subscription.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await checkout({ email, plan, amount });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        navigate(isAuthenticated ? '/analyst' : '/pricing');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass w-full max-w-md rounded-2xl p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Complete Payment</h2>
              </div>
              <button type="button" onClick={onClose} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-text-muted">
              {plan === 'monthly' ? 'Monthly Analyst Plan' : 'Annual Analyst Plan'} — ${amount}
            </p>
            {success ? (
              <p className="py-8 text-center text-accent">
                Payment successful! Analyst subscription active for {email}.
              </p>
            ) : (
              <form onSubmit={handlePay} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Billing email"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                  required
                />
                <input
                  placeholder="Card number"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                  defaultValue="4242 4242 4242 4242"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="MM/YY"
                    className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                    defaultValue="12/28"
                    required
                  />
                  <input
                    placeholder="CVC"
                    className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                    defaultValue="123"
                    required
                  />
                </div>
                <input
                  placeholder="Cardholder name"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                  defaultValue="Demo User"
                  required
                />
                {error && <p className="text-sm text-critical">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-3 font-semibold text-on-primary hover:bg-primary-dim disabled:opacity-60"
                >
                  {loading ? 'Processing...' : `Pay $${amount}`}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

