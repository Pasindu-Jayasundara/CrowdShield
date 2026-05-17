import { useQuery } from 'convex/react';
import { motion } from 'motion/react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import { ScamTypeTag } from '../components/ScamTypeTag';
import { SeverityBadge } from '../components/SeverityBadge';
import { toCampaign } from '../utils/mapDoc';

export function Campaigns() {
  const campaigns = useQuery(api.campaigns.list, {});

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">Campaign Tracking</h1>
        <p className="text-text-muted">Coordinated scam waves detected across regions</p>
        <motion.div className="mt-6 space-y-4">
          {campaigns === undefined && (
            <p className="text-sm text-text-muted">Loading campaigns...</p>
          )}
          {campaigns?.length === 0 && (
            <p className="text-sm text-text-muted">No campaigns detected yet.</p>
          )}
          {campaigns?.map((c, i) => {
            const campaign = toCampaign(c);
            return (
              <motion.div
                key={campaign.id}
                className="glass rounded-xl p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <motion.div>
                    <h2 className="font-semibold">{campaign.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <SeverityBadge severity={campaign.severity} />
                      <ScamTypeTag type={campaign.scamType} />
                      <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs capitalize text-text-muted">
                        {campaign.spreadVelocity} spread
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                          campaign.trend === 'rising'
                            ? 'text-critical'
                            : campaign.trend === 'declining'
                              ? 'text-accent'
                              : 'text-text-muted'
                        }`}
                      >
                        {campaign.trend}
                      </span>
                    </div>
                  </motion.div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{campaign.reportCount}</p>
                    <p className="text-xs text-text-dim">reports</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {campaign.hourlyRate.toFixed(1)}/hr
                  </span>
                  <span>Regions: {campaign.regionsAffected.join(', ')}</span>
                </div>
                <Link to="/analyst/analytics" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  View propagation <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
