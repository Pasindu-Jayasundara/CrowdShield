import { AnimatePresence, motion } from 'motion/react';
import { Play, X } from 'lucide-react';
import { useState } from 'react';

export function SimulationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [launched, setLaunched] = useState(false);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLaunched(true);
    setTimeout(() => {
      onClose();
      setLaunched(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
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
              <button type="button" onClick={onClose}>
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>
            {launched ? (
              <p className="py-8 text-center text-accent">Simulation launched successfully!</p>
            ) : (
              <form onSubmit={handleLaunch} className="space-y-4">
                <div>
                  <label className="text-sm text-text-muted">Scam Type</label>
                  <select className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option>Phishing</option>
                    <option>OTP Phishing</option>
                    <option>Smishing</option>
                  </select>
                </div>
                <motion.div>
                  <label className="text-sm text-text-muted">Intensity</label>
                  <select className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </motion.div>
                <div>
                  <label className="text-sm text-text-muted">Duration (hours)</label>
                  <input type="number" defaultValue={6} min={1} max={48} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-on-primary">
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
