import { BarChart3, Check, Crown, Globe, Shield, Target, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoginModal } from '../components/LoginModal';
import { PaymentModal } from '../components/PaymentModal';

const freeFeatures = ['Submit scam reports', 'AI threat analysis', 'Live community feed', 'Vote on reports', 'Location threats', 'Newsletter'];
const analystFeatures = [
  { icon: Globe, text: 'Geo intelligence maps' },
  { icon: Target, text: 'Campaign tracking' },
  { icon: BarChart3, text: 'Advanced analytics' },
  { icon: Zap, text: 'Nowcast predictions' },
];

export function Pricing() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'analyst' | 'admin'>('analyst');
  const [selectedPlan, setSelectedPlan] = useState<{ plan: 'monthly' | 'annual'; amount: number }>({
    plan: 'monthly',
    amount: 49,
  });

  const openPayment = (plan: 'monthly' | 'annual', amount: number) => {
    setSelectedPlan({ plan, amount });
    setPaymentOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="hero-gradient -mx-4 rounded-2xl px-4 py-12 text-center sm:mx-0">
        <Shield className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-4 text-3xl font-bold">Upgrade to Analyst</h1>
        <p className="mx-auto mt-2 max-w-lg text-text-muted">
          Professional threat intelligence tools for security teams and researchers
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="card p-8">
          <Shield className="h-8 w-8 text-text-muted" />
          <h2 className="mt-4 text-xl font-bold">Free Access</h2>
          <ul className="mt-6 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-low" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="card relative border-2 border-primary p-8">
          <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-on-primary">
            Pro Features
          </span>
          <Zap className="h-8 w-8 text-primary" />
          <h2 className="mt-4 text-xl font-bold">Analyst Access</h2>
          <ul className="mt-6 space-y-3">
            {analystFeatures.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-primary" />
                <Check className="h-4 w-4 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mt-8 border-accent/30 bg-accent/5 p-8 text-center">
        <h3 className="text-lg font-bold">Try Before You Buy</h3>
        <p className="mt-2 text-sm text-text-muted">Sign in with a staff account to access dashboards</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              setLoginRole('analyst');
              setLoginOpen(true);
            }}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3"
          >
            <Shield className="h-4 w-4" />
            Analyst Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginRole('admin');
              setLoginOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-admin px-6 py-3 font-semibold text-on-primary"
          >
            <Crown className="h-4 w-4" />
            Admin Login
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="card p-8 text-center">
          <h3 className="text-lg font-semibold text-text-muted">Monthly</h3>
          <p className="mt-2 text-4xl font-bold">$49</p>
          <p className="text-sm text-text-muted">/month · billed monthly</p>
          <button type="button" onClick={() => openPayment('monthly', 49)} className="mt-6 w-full btn-primary rounded-xl py-3 font-semibold">
            Start Monthly Plan
          </button>
        </div>

        <div className="plan-gradient relative rounded-xl p-8 text-center text-on-primary shadow-lg">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-high px-3 py-0.5 text-xs font-bold text-text">
            SAVE 40%
          </span>
          <h3 className="text-lg font-semibold opacity-90">Annual</h3>
          <p className="mt-2 text-4xl font-bold">$29</p>
          <p className="text-sm opacity-90">/month · billed $348 annually</p>
          <button
            type="button"
            onClick={() => openPayment('annual', 348)}
            className="mt-6 w-full rounded-xl bg-surface py-3 font-semibold text-primary"
          >
            Start Annual Plan
          </button>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center text-xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-4">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. Monthly plans cancel at the end of the billing period.' },
            { q: 'How do I access analyst tools?', a: 'Use staff login with an analyst or admin account.' },
          ].map((faq) => (
            <div key={faq.q} className="card p-5">
              <p className="font-semibold">{faq.q}</p>
              <p className="mt-2 text-sm text-text-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-12 text-center">
        <Link to="/" className="text-sm text-text-muted hover:text-primary">
          ← Back to Home
        </Link>
      </p>

      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} plan={selectedPlan.plan} amount={selectedPlan.amount} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} defaultRole={loginRole} />
    </div>
  );
}
