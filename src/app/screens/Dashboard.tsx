import { Activity, ArrowRight, Clock, Globe, Map, Target, TrendingUp } from 'lucide-react';
import { useQuery } from 'convex/react';
import { Link } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import { MetricCard } from '../components/MetricCard';
import { ReportCard } from '../components/ReportCard';
import { toCampaign, toReport } from '../utils/mapDoc';

export function Dashboard() {
  const reports = useQuery(api.reports.get);
  const campaigns = useQuery(api.campaigns.list, { limit: 3 });
  const stats = useQuery(api.reports.stats);

  const priority =
    reports
      ?.filter((r) => r.severity === 'CRITICAL' || r.severity === 'HIGH')
      .slice(0, 3)
      .map(toReport) ?? [];

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active Threats"
          value={stats ? String(stats.activeThreats) : '—'}
          change="Live from database"
          icon={Activity}
          trend="up"
          tint="critical"
          valueClassName="text-critical"
        />
        <MetricCard
          label="Reports Last Hour"
          value={stats ? String(stats.reportsLastHour) : '—'}
          change="Real-time count"
          icon={TrendingUp}
          trend="up"
          tint="high"
          valueClassName="text-high"
        />
        <MetricCard
          label="Campaigns Detected"
          value={stats ? String(stats.campaignsDetected) : '—'}
          icon={Target}
          tint="purple"
          valueClassName="text-admin"
        />
        <MetricCard
          label="Regions at Risk"
          value={stats ? String(stats.regionsAtRisk) : '—'}
          icon={Globe}
          tint="neutral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Live Threat Feed</h2>
            <Link to="/analyst/feed" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {priority.length === 0 && reports !== undefined && (
              <p className="text-sm text-text-muted">No high-priority threats yet. Submit a report to get started.</p>
            )}
            {priority.map((r) => (
              <ReportCard key={r.id} report={r} showVotes={false} monospace />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold">Threat Heatmap</h3>
            <div className="mt-4 flex h-40 items-center justify-center rounded-lg bg-gradient-to-br from-low/20 via-high/20 to-critical/20">
              <Map className="h-12 w-12 text-text-dim" />
            </div>
            <Link to="/analyst/geo" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              View full map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card p-5">
            <h3 className="font-bold">Top Active Campaigns</h3>
            <ul className="mt-4 space-y-3">
              {(campaigns ?? []).map((c) => {
                const campaign = toCampaign(c);
                return (
                  <li key={campaign.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{campaign.name}</p>
                      <p className="text-xs text-text-muted">{campaign.reportCount} reports</p>
                    </div>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        campaign.spreadVelocity === 'fast'
                          ? 'text-critical'
                          : campaign.spreadVelocity === 'medium'
                            ? 'text-high'
                            : 'text-low'
                      }`}
                    >
                      {campaign.spreadVelocity}
                    </span>
                  </li>
                );
              })}
            </ul>
            <Link to="/analyst/campaigns" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              View all campaigns <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-high/30 bg-high/10 p-4 text-sm">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-high" />
        <p>
          <strong>Nowcast:</strong> High phishing risk expected in Western Province in the next 6 hours based on
          velocity trends.
        </p>
      </div>
    </div>
  );
}
