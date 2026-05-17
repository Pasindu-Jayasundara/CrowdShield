import { AnimatePresence, motion } from 'motion/react';
import { Play, X } from 'lucide-react';
import { useState } from 'react';
import { REGION_OPTIONS } from '../data/sriLankaRegions';
import type { SimulationConfig } from '../types/geo';

export function SimulationModal({
  open,
  onClose,
  onLaunch,
}: {
  open: boolean;
  onClose: () => void;
  onLaunch: (config: SimulationConfig) => void;
}) {
  const [launched, setLaunched] = useState(false);
  const [scamType, setScamType] = useState('Phishing');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [durationHours, setDurationHours] = useState(6);
  const [originRegion, setOriginRegion] = useState<string>('Colombo');

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunch({ scamType, intensity, durationHours, originRegion });
    setLaunched(true);
    setTimeout(() => {
      onClose();
      setLaunched(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass w-full max-w-lg rounded-2xl p-6"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Launch Attack Simulation</h2>
              <button type="button" onClick={onClose} aria-label="Close">
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>
            {launched ? (
              <p className="py-8 text-center text-accent">Simulation launched — watch the map update</p>
            ) : (
              <form onSubmit={handleLaunch} className="space-y-4">
                <p className="text-sm text-text-muted">
                  Injects synthetic threat clusters on the geo map to model how a coordinated scam wave
                  might spread from an origin region.
                </p>
                <div>
                  <label className="text-sm text-text-muted">Origin region</label>
                  <select
                    value={originRegion}
                    onChange={(e) => setOriginRegion(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  >
                    {REGION_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-muted">Scam type</label>
                  <select
                    value={scamType}
                    onChange={(e) => setScamType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  >
                    <option>Phishing</option>
                    <option>OTP Phishing</option>
                    <option>Smishing</option>
                    <option>Job Scam</option>
                    <option>Investment Scam</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-muted">Intensity</label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as typeof intensity)}
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-muted">Duration (hours)</label>
                  <input
                    type="number"
                    value={durationHours}
                    min={1}
                    max={48}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-on-primary"
                >
                  <Play className="h-4 w-4" />
                  Launch Simulation
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
