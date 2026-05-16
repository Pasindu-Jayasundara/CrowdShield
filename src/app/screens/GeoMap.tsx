import { useQuery } from 'convex/react';
import { Layers, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '../../../convex/_generated/api';
import { SimulationBanner } from '../components/SimulationBanner';
import { SimulationModal } from '../components/SimulationModal';
import { SeverityBadge } from '../components/SeverityBadge';
import { ThreatMap } from '../components/ThreatMap';
import { buildSimulationClusters } from '../data/sriLankaRegions';
import type { GeoCluster, SimulationConfig } from '../types/geo';
import type { Severity } from '../types';

const TIME_RANGES = [
  { label: 'Last 1h', hours: 1 },
  { label: 'Last 24h', hours: 24 },
  { label: 'Last 7d', hours: 168 },
] as const;

export function GeoMap() {
  const [timeRangeHours, setTimeRangeHours] = useState(168);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<GeoCluster | null>(null);
  const [simOpen, setSimOpen] = useState(false);
  const [simulation, setSimulation] = useState<SimulationConfig | null>(null);
  const [simulatedClusters, setSimulatedClusters] = useState<GeoCluster[]>([]);
  const [layers, setLayers] = useState({ heatmap: true, clusters: true, campaigns: true });

  const mapData = useQuery(api.geo.mapData, { timeRangeHours });

  const liveClusters = useMemo(() => {
    const base = mapData?.clusters ?? [];
    const merged = [...base];
    for (const sim of simulatedClusters) {
      const idx = merged.findIndex((c) => c.region === sim.region);
      if (idx >= 0) {
        merged[idx] = {
          ...merged[idx],
          count: merged[idx].count + sim.count,
          severity: pickHigherSeverity(merged[idx].severity, sim.severity),
          topScamType: sim.topScamType,
          trend: 'Rising',
          isSimulated: true,
        };
      } else {
        merged.push(sim);
      }
    }
    return merged;
  }, [mapData?.clusters, simulatedClusters]);

  const filteredClusters = useMemo(() => {
    if (!search.trim()) return liveClusters;
    const q = search.toLowerCase();
    return liveClusters.filter((c) => c.region.toLowerCase().includes(q));
  }, [liveClusters, search]);

  const handleLaunchSimulation = (config: SimulationConfig) => {
    setSimulation(config);
    setSimulatedClusters(buildSimulationClusters(config));
    setSelected(null);
  };

  const endSimulation = () => {
    setSimulation(null);
    setSimulatedClusters([]);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:h-[calc(100vh-0px)]">
      {simulation && <SimulationBanner onEnd={endSimulation} config={simulation} />}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <h1 className="text-xl font-bold">Geo Intelligence Map</h1>
          <p className="text-sm text-text-muted">
            {mapData === undefined
              ? 'Loading threat geography…'
              : `${mapData.totalReports} reports · ${filteredClusters.length} regions`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
            <Search className="h-4 w-4 text-text-dim" />
            <input
              placeholder="Search region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-32 bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={timeRangeHours}
            onChange={(e) => setTimeRangeHours(Number(e.target.value))}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
          >
            {TIME_RANGES.map(({ label, hours }) => (
              <option key={hours} value={hours}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSimOpen(true)}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-on-primary"
          >
            Launch Simulation
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="absolute left-4 top-4 z-[500] glass rounded-lg p-3 shadow-md">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold">
            <Layers className="h-4 w-4" />
            Layers
          </p>
          {Object.entries(layers).map(([key, on]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 py-1 text-sm capitalize">
              <input
                type="checkbox"
                checked={on}
                onChange={() => setLayers((l) => ({ ...l, [key]: !l[key as keyof typeof l] }))}
                className="accent-primary"
              />
              {key}
            </label>
          ))}
          <div className="mt-3 border-t border-border pt-2">
            <p className="text-xs text-text-dim">Severity scale</p>
            <div className="mt-1 h-2 w-full rounded-full bg-gradient-to-r from-low via-medium to-critical" />
          </div>
        </div>

        <div className="relative min-h-[400px] flex-1 bg-gray-100">
          {mapData === undefined ? (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              Loading map…
            </div>
          ) : (
            <ThreatMap
              clusters={filteredClusters}
              campaignMarkers={mapData.campaignMarkers}
              showHeatmap={layers.heatmap}
              showClusters={layers.clusters}
              showCampaigns={layers.campaigns}
              selectedRegion={selected?.region ?? null}
              onSelectCluster={setSelected}
            />
          )}
        </div>

        {selected && (
          <aside className="w-80 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
            <h2 className="text-lg font-bold">{selected.region}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <SeverityBadge severity={selected.severity} />
              {selected.isSimulated && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  Simulated
                </span>
              )}
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-dim">Total reports</dt>
                <dd className="font-semibold">{selected.count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-dim">Top scam type</dt>
                <dd>{selected.topScamType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-dim">Trend</dt>
                <dd
                  className={
                    selected.trend === 'Rising'
                      ? 'text-critical'
                      : selected.trend === 'Declining'
                        ? 'text-accent'
                        : 'text-text-muted'
                  }
                >
                  {selected.trend}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-dim">Coordinates</dt>
                <dd className="font-mono text-xs">
                  {selected.lat.toFixed(2)}, {selected.lng.toFixed(2)}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              className="mt-6 w-full rounded-lg border border-primary py-2 text-sm text-primary hover:bg-primary/5"
            >
              Set alert for this region
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-2 w-full text-sm text-text-dim hover:text-text"
            >
              Close panel
            </button>
          </aside>
        )}
      </div>

      <SimulationModal
        open={simOpen}
        onClose={() => setSimOpen(false)}
        onLaunch={handleLaunchSimulation}
      />
    </div>
  );
}

function pickHigherSeverity(a: Severity, b: Severity): Severity {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  return rank[a] >= rank[b] ? a : b;
}
