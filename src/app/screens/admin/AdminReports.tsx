import { useMutation, useQuery } from 'convex/react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { SeverityBadge } from '../../components/SeverityBadge';
import { getSessionToken } from '../../utils/sessionToken';

export function AdminReports() {
  const reports = useQuery(api.reports.get);
  const updateStatus = useMutation(api.reports.updateStatus);

  const handleStatus = async (reportId: Id<'reports'>, status: 'verified' | 'false_positive') => {
    const sessionToken = getSessionToken();
    await updateStatus({ reportId, status, sessionToken: sessionToken ?? undefined });
  };

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">Report Moderation</h1>
        <p className="text-text-muted">Review and verify community submissions</p>
        <motion.div className="mt-6 space-y-4">
          {reports === undefined && (
            <p className="text-sm text-text-muted">Loading reports...</p>
          )}
          {reports?.map((r) => (
            <div key={r._id} className="glass rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <SeverityBadge severity={r.severity} />
                    <span className="text-xs text-text-dim capitalize">{r.status}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm">{r.content}</p>
                  <p className="mt-1 text-xs text-text-dim">
                    Threat: {r.threatScore ?? r.aiScore} (AI {r.aiScore}, community{' '}
                    {r.communityScore ?? 0}) — {r.aiReasoning.slice(0, 60)}...
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatus(r._id, 'verified')}
                    className="flex items-center gap-1 rounded-lg bg-accent/20 px-3 py-1.5 text-xs text-accent"
                  >
                    <Check className="h-3 w-3" />
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatus(r._id, 'false_positive')}
                    className="flex items-center gap-1 rounded-lg bg-critical/20 px-3 py-1.5 text-xs text-critical"
                  >
                    <X className="h-3 w-3" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
