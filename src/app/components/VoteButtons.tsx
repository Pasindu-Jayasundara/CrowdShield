import { useMutation, useQuery } from 'convex/react';
import { motion } from 'motion/react';
import { AlertTriangle, Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import type { VoteType } from '../types';
import { getVoterId } from '../utils/voterId';

export function VoteButtons({ reportId }: { reportId: string }) {
  const voterId = getVoterId();
  const isValidReport = reportId !== 'new';

  const existingVote = useQuery(
    api.reports.getMyVote,
    isValidReport
      ? { reportId: reportId as Id<'reports'>, voterId }
      : 'skip',
  );

  const voted = existingVote ?? null;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const vote = useMutation(api.reports.vote);

  const handleVote = async (type: VoteType) => {
    if (voted !== null || !isValidReport || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await vote({
        reportId: reportId as Id<'reports'>,
        voterId,
        voteType: type,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record vote');
    } finally {
      setSubmitting(false);
    }
  };

  const buttons: { type: VoteType; label: string; icon: typeof ShieldX; hover: string }[] = [
    { type: 'scam', label: 'Scam', icon: ShieldX, hover: 'hover:border-critical hover:text-critical' },
    { type: 'suspicious', label: 'Suspicious', icon: AlertTriangle, hover: 'hover:border-high hover:text-high' },
    { type: 'safe', label: 'Safe', icon: ShieldCheck, hover: 'hover:border-low hover:text-low' },
  ];

  const disabled = voted !== null || submitting || !isValidReport || existingVote === undefined;

  return (
    <motion.div className="flex flex-col gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-wrap gap-2">
        {buttons.map(({ type, label, icon: Icon, hover }) => (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => handleVote(type)}
            className={`flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted transition ${hover} ${
              voted === type ? 'border-primary bg-primary/5 text-primary' : ''
            } disabled:opacity-70`}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
            {label}
          </button>
        ))}
        {voted && <span className="self-center text-xs text-accent">Vote recorded</span>}
        {existingVote === undefined && isValidReport && (
          <span className="self-center text-xs text-text-dim">Checking vote...</span>
        )}
      </div>
      {error && <p className="text-xs text-critical">{error}</p>}
      {!isValidReport && (
        <p className="text-xs text-text-dim">Submit the report first to enable voting.</p>
      )}
    </motion.div>
  );
}
