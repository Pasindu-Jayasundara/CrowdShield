import { motion } from 'motion/react';
import { FlaskConical, X } from 'lucide-react';
import type { SimulationConfig } from '../types/geo';

export function SimulationBanner({
  config,
  onEnd,
}: {
  config: SimulationConfig;
  onEnd: () => void;
}) {
  return (
    <motion.div
      className="flex items-center justify-between gap-3 border-b border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
    >
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 shrink-0" />
        <span>
          Active simulation: <strong>{config.scamType}</strong> from {config.originRegion} ·{' '}
          {config.intensity} intensity · {config.durationHours}h — synthetic clusters on map
        </span>
      </div>
      <button
        type="button"
        onClick={onEnd}
        className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-surface px-2 py-1 text-xs font-semibold hover:bg-gray-50"
      >
        <X className="h-3 w-3" />
        End simulation
      </button>
    </motion.div>
  );
}
