import { motion } from 'motion/react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScamTypeTag } from '../components/ScamTypeTag';
import { SeverityBadge } from '../components/SeverityBadge';
import { mockCampaigns } from '../data/mockData';

export function Campaigns() {
  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">Campaign Tracking</h1>
        <p className="text-text-muted">Coordinated scam waves detected across regions</p>
        <motion.div className="mt-6 space-y-4">
          {mockCampaigns.map((c, i) => (
            <motion.div
              key={c.id}
              className="glass rounded-xl p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <motion.div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <SeverityBadge severity={c.severity} />
                    <ScamTypeTag type={c.scamType} />
                    <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs capitalize text-text-muted">
                      {c.spreadVelocity} spread
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                        c.trend === 'rising' ? 'text-critical' : c.trend === 'declining' ? 'text-accent' : 'text-text-muted'
                      }`}
                    >
                      {c.trend}
                    </span>
                  </div>
                </motion.div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{c.reportCount}</p>
                  <p className="text-xs text-text-dim">reports</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {c.hourlyRate.toFixed(1)}/hr
                </span>
                <span>Regions: {c.regionsAffected.join(', ')}</span>
              </div>
              <Link to="/analyst/analytics" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                View propagation <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
