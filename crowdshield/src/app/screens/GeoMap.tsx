import { motion } from 'motion/react';
import { Layers, Search } from 'lucide-react';
import { useState } from 'react';
import { SeverityBadge } from '../components/SeverityBadge';
import { SimulationModal } from '../components/SimulationModal';

const clusters = [
  { lat: 35, left: '45%', count: 156, severity: 'CRITICAL' as const, region: 'Colombo' },
  { lat: 55, left: '30%', count: 89, severity: 'HIGH' as const, region: 'Kandy' },
  { lat: 70, left: '60%', count: 45, severity: 'MEDIUM' as const, region: 'Galle' },
];

export function GeoMap() {
  const [selected, setSelected] = useState<(typeof clusters)[0] | null>(null);
  const [simOpen, setSimOpen] = useState(false);
  const [layers, setLayers] = useState({ heatmap: true, clusters: true, campaigns: false });

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h1 className="text-xl font-bold">Geo Intelligence Map</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
            <Search className="h-4 w-4 text-text-dim" />
            <input placeholder="Search region..." className="bg-transparent text-sm outline-none w-32" />
          </div>
          <select className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm">
            <option>Last 24h</option>
            <option>Last 1h</option>
            <option>Last 7d</option>
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
      <div className="relative flex flex-1 overflow-hidden">
        <div className="absolute left-4 top-4 z-10 glass rounded-lg p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold">
            <Layers className="h-4 w-4" />
            Layers
          </p>
          {Object.entries(layers).map(([key, on]) => (
            <label key={key} className="flex items-center gap-2 py-1 text-sm capitalize">
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
            <p className="text-xs text-text-dim">Heatmap scale</p>
            <motion.div className="mt-1 h-2 w-full rounded-full bg-gradient-to-r from-low via-medium to-critical" />
          </div>
        </div>

        <div className="relative flex-1 bg-gray-50">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D1D5DB' fill-opacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {layers.clusters &&
            clusters.map((c) => (
              <motion.button
                key={c.region}
                type="button"
                className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-on-primary shadow-md"
                style={{
                  top: `${c.lat}%`,
                  left: c.left,
                  backgroundColor:
                    c.severity === 'CRITICAL' ? 'rgba(232,64,64,0.9)' : 'rgba(245,166,35,0.9)',
                  boxShadow: `0 0 16px ${c.severity === 'CRITICAL' ? '#E84040' : '#F5A623'}60`,
                }}
                onClick={() => setSelected(c)}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {c.count}
              </motion.button>
            ))}
        </div>

        {selected && (
          <motion.aside
            className="w-80 border-l border-border bg-surface p-4"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
          >
            <h2 className="text-lg font-bold">{selected.region}</h2>
            <div className="mt-2">
              <SeverityBadge severity={selected.severity} />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <motion.div className="flex justify-between">
                <dt className="text-text-dim">Total reports</dt>
                <dd className="font-semibold">{selected.count}</dd>
              </motion.div>
              <div className="flex justify-between">
                <dt className="text-text-dim">Top scam type</dt>
                <dd>Phishing</dd>
              </div>
              <motion.div className="flex justify-between">
                <dt className="text-text-dim">Trend</dt>
                <dd className="text-critical">Rising</dd>
              </motion.div>
            </dl>
            <button type="button" className="mt-6 w-full rounded-lg border border-primary py-2 text-sm text-primary">
              Set alert for this region
            </button>
            <button type="button" onClick={() => setSelected(null)} className="mt-2 w-full text-sm text-text-dim">
              Close panel
            </button>
          </motion.aside>
        )}
      </div>
      <SimulationModal open={simOpen} onClose={() => setSimOpen(false)} />
    </div>
  );
}
