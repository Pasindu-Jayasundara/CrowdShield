import { Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import type { Report } from '../types';
import { ScamTypeTag } from './ScamTypeTag';
import { SeverityBadge } from './SeverityBadge';
import { ThreatScoreMini } from './ThreatScoreMini';
import { VoteButtons } from './VoteButtons';

export function ReportCard({
  report,
  showVotes = true,
  monospace = false,
}: {
  report: Report;
  showVotes?: boolean;
  monospace?: boolean;
}) {
  const timeAgo = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.round((new Date(report.createdAt).getTime() - Date.now()) / 3600000),
    'hour',
  );

  return (
    <motion.article className="card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} layout>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={report.severity} solid />
            <ScamTypeTag type={report.scamType} />
          </div>
          <p
            className={`mt-3 font-semibold leading-snug text-text ${monospace ? 'font-mono text-sm font-normal' : ''}`}
          >
            {report.content}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            {report.region && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {report.region}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo}
            </span>
          </div>
          {showVotes && (
            <div className="mt-4 border-t border-border pt-4">
              <VoteButtons reportId={report.id} />
            </div>
          )}
        </div>
        <motion.div className="flex shrink-0 flex-col items-center">
          <ThreatScoreMini
            score={report.threatScore ?? report.aiScore}
            severity={report.severity}
          />
          <span className="mt-1 text-[10px] text-text-dim">Threat Score</span>
        </motion.div>
      </div>
    </motion.article>
  );
}
