import { motion } from 'motion/react';
import { Bell } from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';

const alerts = [
  { id: '1', title: 'OTP Phishing surge — Colombo', severity: 'CRITICAL' as const, time: '12 min ago', region: 'Colombo' },
  { id: '2', title: 'New campaign: Job Scam Wave', severity: 'HIGH' as const, time: '1 hr ago', region: 'Nationwide' },
  { id: '3', title: 'Investment scam cluster — Jaffna', severity: 'MEDIUM' as const, time: '3 hrs ago', region: 'Jaffna' },
];

export function Alerts() {
  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold">Alert Center</h1>
      <p className="text-text-muted">Priority threat notifications for analysts</p>
      <div className="mt-4 flex gap-2">
        {['All', 'Critical', 'Campaign', 'Regional'].map((f) => (
          <button key={f} type="button" className="rounded-lg border border-border px-3 py-1 text-sm hover:bg-surface-elevated">
            {f}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {alerts.map((a, i) => (
          <motion.div
            key={a.id}
            className="glass flex items-center gap-4 rounded-xl p-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Bell className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-text-dim">
                {a.region} · {a.time}
              </p>
            </div>
            <SeverityBadge severity={a.severity} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
