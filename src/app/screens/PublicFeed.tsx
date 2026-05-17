import { useQuery } from 'convex/react';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import { PageHeader } from '../components/PageHeader';
import { ReportCard } from '../components/ReportCard';
import { toReport } from '../utils/mapDoc';
import { severityFromThreatScore } from '../utils/threatScore';
import type { Severity } from '../types';

export function PublicFeed() {
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const reports = useQuery(api.reports.list, {});

  const mapped = (reports?.map(toReport) ?? []).filter((r) => {
    if (filter === 'all') return true;
    const threatScore = r.threatScore ?? r.aiScore;
    return severityFromThreatScore(threatScore) === filter;
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Community Threat Feed"
        subtitle="Real-time scam reports validated by the community"
        action={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-dim" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Severity | 'all')}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        }
      />

      <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
        <p className="font-semibold text-text">How to Vote</p>
        <ul className="mt-2 space-y-1 text-text-muted">
          <li>
            <span className="font-medium text-critical">Scam</span> — Clearly fraudulent
          </li>
          <li>
            <span className="font-medium text-high">Suspicious</span> — Needs more review
          </li>
          <li>
            <span className="font-medium text-low">Safe</span> — Likely legitimate
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        {reports === undefined && (
          <p className="text-sm text-text-muted">Loading feed...</p>
        )}
        {mapped.length === 0 && reports !== undefined && (
          <p className="text-sm text-text-muted">No reports match this filter.</p>
        )}
        {mapped.map((r) => (
          <ReportCard key={r.id} report={r} monospace />
        ))}
      </div>

      <div className="card mt-8 p-6">
        <h3 className="font-bold">Your Contribution</h3>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{mapped.reduce((s, r) => s + r.totalVotes, 0)}</p>
            <p className="text-xs text-text-muted">Community Votes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{mapped.length}</p>
            <p className="text-xs text-text-muted">Reports in Feed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-low">
              {mapped.length > 0
                ? `${Math.round((mapped.filter((r) => r.status === 'verified').length / mapped.length) * 100)}%`
                : '—'}
            </p>
            <p className="text-xs text-text-muted">Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
}
