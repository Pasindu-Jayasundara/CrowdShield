import { MapPin, Navigation, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { ReportCard } from '../components/ReportCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { mockReports } from '../data/mockData';

export function MyLocationThreats() {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const enableLocation = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLocationEnabled(true);
    setLoading(false);
  };

  if (!locationEnabled) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-high/15">
          <MapPin className="h-12 w-12 text-high" />
        </div>
        <h1 className="mt-8 text-2xl font-bold">Location Access Required</h1>
        <p className="mt-4 text-text-muted">
          To show threats in your area, we need access to your location. Your location data is never stored or
          shared.
        </p>
        <button
          type="button"
          onClick={enableLocation}
          disabled={loading}
          className="mt-8 btn-primary rounded-xl px-8 py-3 font-semibold"
        >
          <Navigation className="mr-2 inline h-5 w-5" />
          {loading ? 'Getting location...' : 'Enable Location'}
        </button>
      </div>
    );
  }

  const localReports = mockReports.filter((r) => r.region === 'Colombo' || r.region === 'Negombo');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <MapPin className="h-4 w-4" />
              Colombo, Sri Lanka
            </p>
            <h1 className="mt-2 text-2xl font-bold">Local Threat Level</h1>
          </div>
          <SeverityBadge severity="HIGH" solid />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Active Threats', value: '12' },
            { label: '24h Increase', value: '+23%', highlight: true },
            { label: 'Trend', value: 'Rising', icon: TrendingUp },
            { label: 'Top Scam', value: 'Phishing' },
          ].map(({ label, value, highlight, icon: Icon }) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3 text-center sm:text-left">
              <p className="text-xs text-text-muted">{label}</p>
              <p className={`mt-1 flex items-center justify-center gap-1 font-bold sm:justify-start ${highlight ? 'text-critical' : ''}`}>
                {Icon && <Icon className="h-4 w-4 text-critical" />}
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-accent">
            <Shield className="h-4 w-4" />
            Safety tips for your area
          </h3>
          <ul className="mt-2 list-inside list-disc text-sm text-text-muted">
            <li>Verify bank messages through official apps only</li>
            <li>Never share OTP codes with anyone</li>
            <li>Report suspicious SMS to your carrier</li>
          </ul>
        </div>
      </div>
      <h2 className="mb-4 mt-8 text-lg font-semibold">Recent Local Reports</h2>
      <div className="space-y-4">
        {localReports.map((r) => (
          <ReportCard key={r.id} report={r} monospace />
        ))}
      </div>
    </div>
  );
}
