import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { PageHeader } from '../components/PageHeader';
import { ReportCard } from '../components/ReportCard';
import { toReport } from '../utils/mapDoc';

export function LiveFeed() {
  const reports = useQuery(api.reports.get);

  return (
    <div>
      <PageHeader title="Live Threat Feed" subtitle="Community-reported scams in real time" />
      <div className="space-y-4">
        {reports === undefined && (
          <p className="text-sm text-text-muted">Loading reports...</p>
        )}
        {reports?.length === 0 && (
          <p className="text-sm text-text-muted">No reports yet. Be the first to submit one.</p>
        )}
        {reports?.map((r) => (
          <ReportCard key={r._id} report={toReport(r)} monospace />
        ))}
      </div>
    </div>
  );
}
