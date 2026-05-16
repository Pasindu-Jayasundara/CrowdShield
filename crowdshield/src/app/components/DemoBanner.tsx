import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function DemoBanner({ variant = 'analyst' }: { variant?: 'analyst' | 'admin' }) {
  const { demoMode, exitDemo } = useApp();
  if (!demoMode) return null;

  const label =
    variant === 'admin'
      ? 'Admin Demo Mode — Exploring admin panel'
      : 'Demo Mode — Exploring Analyst Dashboard';

  return (
    <motion.div
      className="flex items-center justify-center gap-3 border-b border-demo/30 bg-demo/15 px-4 py-2.5 text-sm font-medium text-text"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={exitDemo}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1 text-xs font-semibold shadow-sm hover:bg-gray-50"
      >
        <X className="h-3 w-3" />
        Exit Demo
      </button>
    </motion.div>
  );
}
