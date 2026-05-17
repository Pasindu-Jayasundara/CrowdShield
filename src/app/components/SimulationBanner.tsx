import { motion } from 'motion/react';
import { FlaskConical, Map, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SimulationConfig } from '../types/geo';

export function SimulationBanner({
  config,
  currentWave,
  maxWaves,
  progressPct,
  elapsedMinutes,
  onEnd,
}: {
  config: SimulationConfig;
  currentWave: number;
  maxWaves: number;
  progressPct: number;
  elapsedMinutes: number;
  onEnd: () => void;
}) {
  return (
    <motion.div
      className="border-b border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FlaskConical className="h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p>
              <strong>Simulation active:</strong> {config.scamType} from {config.originRegion} ·{' '}
              {config.intensity} intensity · {config.durationHours}h window
            </p>
            <p className="text-xs text-primary/80">
              Wave {currentWave + 1}/{maxWaves} · {elapsedMinutes}m elapsed · synthetic clusters spreading
            </p>
            <div className="mt-1.5 h-1.5 max-w-md overflow-hidden rounded-full bg-primary/20">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/analyst/geo"
            className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-surface px-2.5 py-1 text-xs font-semibold hover:bg-gray-50"
          >
            <Map className="h-3 w-3" />
            View map
          </Link>
          <button
            type="button"
            onClick={onEnd}
            className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-surface px-2.5 py-1 text-xs font-semibold hover:bg-gray-50"
          >
            <X className="h-3 w-3" />
            End simulation
          </button>
        </div>
      </div>
    </motion.div>
  );
}
