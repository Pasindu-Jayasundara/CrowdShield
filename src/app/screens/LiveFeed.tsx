import { PageHeader } from '../components/PageHeader';
import { ReportCard } from '../components/ReportCard';
import { mockReports } from '../data/mockData';

export function LiveFeed() {
  return (
    <div>
      <PageHeader title="Live Threat Feed" subtitle="Community-reported scams in real time" />
      <div className="space-y-4">
        {mockReports.map((r) => (
          <ReportCard key={r.id} report={r} monospace />
        ))}
      </div>
    </div>
  );
}
