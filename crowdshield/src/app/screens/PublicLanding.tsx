import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Crown,
  MapPin,
  Shield,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: AlertTriangle, title: 'Report Scams', desc: 'Submit suspicious messages for instant AI analysis.', color: 'text-primary' },
  { icon: BarChart3, title: 'Live Feed', desc: 'Browse real-time community threat reports.', color: 'text-accent' },
  { icon: MapPin, title: 'Local Threats', desc: 'See scams reported near your location.', color: 'text-primary' },
  { icon: Users, title: 'Vote & Verify', desc: 'Help validate reports with community votes.', color: 'text-accent' },
];

const recentThreats = [
  { name: 'Bank OTP Phishing', reports: 1247, severity: 'CRITICAL' as const },
  { name: 'Job Registration Scam', reports: 834, severity: 'HIGH' as const },
  { name: 'Package Delivery SMS', reports: 567, severity: 'HIGH' as const },
];

export function PublicLanding() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <section className="hero-gradient border-b border-border px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative mx-auto max-w-4xl text-center">
          <Link
            to="/pricing"
            className="absolute right-0 top-0 hidden items-center gap-1 rounded-full btn-primary px-4 py-2 text-sm sm:inline-flex"
          >
            <Crown className="h-4 w-4" />
            Upgrade to Analyst
          </Link>
          <Shield className="mx-auto h-16 w-16 text-accent" />
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Community-Powered
            <br />
            Scam Detection
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Detect, track, and prevent online scams with AI analysis and community validation — free for everyone.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/submit" className="inline-flex items-center gap-2 rounded-xl btn-primary px-6 py-3 font-semibold">
              Report a Scam
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/feed" className="btn-outline rounded-xl px-6 py-3 font-semibold">
              Live Threat Feed
            </Link>
            <Link to="/near-me" className="inline-flex items-center gap-2 rounded-xl btn-accent px-6 py-3 font-semibold">
              <MapPin className="h-4 w-4" />
              Near Me
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <motion.div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: AlertTriangle, value: '24,847', label: 'Scams Reported', color: 'text-primary' },
            { icon: Users, value: '15,293', label: 'Active Contributors', color: 'text-accent' },
            { icon: Zap, value: '98.4%', label: 'Detection Accuracy', color: 'text-low' },
          ].map((s) => (
            <div key={s.label} className="card flex flex-col items-center p-6 text-center">
              <s.icon className={`mb-3 h-8 w-8 ${s.color}`} />
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-sm text-text-muted">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="border-t border-border bg-surface px-4 py-16 sm:px-6">
        <motion.div className="mx-auto max-w-6xl text-center">
          <h2 className="text-2xl font-bold">Free Features for Everyone</h2>
          <p className="mt-2 text-text-muted">No account required to protect your community</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="card p-6 text-left">
                <f.icon className={`mb-4 h-8 w-8 ${f.color}`} />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="card flex flex-col items-center gap-6 border-primary/20 bg-primary/5 p-8 sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary">
            <Zap className="h-10 w-10 text-on-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold">Need More Power?</h2>
            <p className="mt-2 text-text-muted">
              Unlock geo intelligence, campaign tracking, predictive analytics, and professional export tools.
            </p>
            <p className="mt-1 text-sm text-text-dim">Starting at $29/month</p>
          </div>
          <Link to="/pricing" className="btn-accent shrink-0 rounded-xl px-6 py-3 font-semibold">
            View Analyst Plans
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Verified Threats</h2>
          <Link to="/feed" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="card divide-y divide-border overflow-hidden">
          {recentThreats.map((t) => (
            <div key={t.name} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${t.severity === 'CRITICAL' ? 'bg-critical' : 'bg-high'}`}
                />
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.reports.toLocaleString()} reports</p>
                </div>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  t.severity === 'CRITICAL' ? 'bg-critical/10 text-critical' : 'bg-high/10 text-high'
                }`}
              >
                {t.severity === 'CRITICAL' ? 'Critical' : 'High'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
        <div className="card flex flex-col gap-4 bg-gray-50 p-6 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15">
            <Shield className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold">Stay Protected</h2>
            <p className="text-sm text-text-muted">Weekly threat digest — no spam, unsubscribe anytime.</p>
          </div>
          <form className="flex w-full gap-2 sm:max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm"
            />
            <button type="submit" className="btn-accent shrink-0 rounded-lg px-5">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <section className="cta-gradient px-4 py-16 text-center text-on-primary sm:px-6">
        <h2 className="text-2xl font-bold">Received Something Suspicious?</h2>
        <p className="mt-2 opacity-90">Report it now and help protect your community.</p>
        <Link
          to="/submit"
          className="mt-8 inline-block rounded-xl bg-surface px-8 py-3 font-semibold text-accent shadow-sm"
        >
          Submit Report
        </Link>
      </section>
    </motion.div>
  );
}
