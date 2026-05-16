import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { SeverityBadge } from '../../components/SeverityBadge';
import { mockReports } from '../../data/mockData';

export function AdminReports() {
  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">Report Moderation</h1>
        <p className="text-text-muted">Review and verify community submissions</p>
        <motion.div className="mt-6 space-y-4">
          {mockReports.map((r) => (
            <div key={r.id} className="glass rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <SeverityBadge severity={r.severity} />
                    <span className="text-xs text-text-dim capitalize">{r.status}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm">{r.content}</p>
                  <p className="mt-1 text-xs text-text-dim">AI: {r.aiScore} — {r.aiReasoning.slice(0, 80)}...</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="flex items-center gap-1 rounded-lg bg-accent/20 px-3 py-1.5 text-xs text-accent">
                    <Check className="h-3 w-3" />
                    Verify
                  </button>
                  <button type="button" className="flex items-center gap-1 rounded-lg bg-critical/20 px-3 py-1.5 text-xs text-critical">
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
