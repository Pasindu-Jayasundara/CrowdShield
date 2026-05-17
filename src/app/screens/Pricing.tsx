import { BarChart3, Check, Crown, Globe, Shield, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useApp } from '../context/AppContext';

const freeFeatures = ['Submit scam reports', 'AI threat analysis', 'Live community feed', 'Vote on reports', 'Location threats', 'Newsletter'];
const analystFeatures = [
  { icon: Globe, text: 'Geo intelligence maps' },
  { icon: Target, text: 'Campaign tracking' },
  { icon: BarChart3, text: 'Advanced analytics' },
  { icon: Zap, text: 'Nowcast predictions' },
];

export function Pricing() {
  const navigate = useNavigate();
  const { enterAnalystDemo, enterAdminDemo } = useApp();
  const createSubscription = useMutation(api.subscriptions.createSubscription);
  const requestAnalystRole = useMutation(api.auth.requestAnalystRole);

  const handleSubscribe = async (plan: string) => {
    try {
      await createSubscription({
        plan,
        status: "active",
      });
      await requestAnalystRole();
      alert(`Subscribed to ${plan} and role updated to analyst!`);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to subscribe.");
    }
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

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="card p-8">
            <h3 className="text-lg font-bold">Monthly</h3>
            <p className="text-3xl font-bold mt-2">$49/mo</p>
            <button
                type="button"
                onClick={() => handleSubscribe("monthly")}
                className="btn-primary mt-4 w-full"
            >
                Subscribe
            </button>
        </div>
        <div className="card p-8">
            <h3 className="text-lg font-bold">Annual</h3>
            <p className="text-3xl font-bold mt-2">$499/yr</p>
            <button
                type="button"
                onClick={() => handleSubscribe("annual")}
                className="btn-primary mt-4 w-full"
            >
                Subscribe
            </button>
        </div>
      </div>

      <div className="card mt-8 border-accent/30 bg-accent/5 p-8 text-center">
        <h3 className="text-lg font-bold">Try Before You Buy</h3>
        <p className="mt-2 text-sm text-text-muted">Explore full analyst and admin dashboards — no payment required</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              enterAnalystDemo();
              navigate('/analyst');
            }}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3"
          >
            <Shield className="h-4 w-4" />
            View Analyst Dashboard
          </button>
          <button
            type="button"
            onClick={() => {
              enterAdminDemo();
              navigate('/admin');
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-admin px-6 py-3 font-semibold text-on-primary"
          >
            <Crown className="h-4 w-4" />
            View Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
