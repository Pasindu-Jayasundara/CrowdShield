import { motion } from 'motion/react';
import { AlertTriangle, ShieldCheck, ShieldX } from 'lucide-react';
import { useState } from 'react';
import type { VoteType } from '../types';

export function VoteButtons({ reportId: _reportId }: { reportId: string }) {
  const [voted, setVoted] = useState<VoteType | null>(null);

  const buttons: { type: VoteType; label: string; icon: typeof ShieldX; hover: string }[] = [
    { type: 'scam', label: 'Scam', icon: ShieldX, hover: 'hover:border-critical hover:text-critical' },
    { type: 'suspicious', label: 'Suspicious', icon: AlertTriangle, hover: 'hover:border-high hover:text-high' },
    { type: 'safe', label: 'Safe', icon: ShieldCheck, hover: 'hover:border-low hover:text-low' },
  ];

  return (
    <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {buttons.map(({ type, label, icon: Icon, hover }) => (
        <button
          key={type}
          type="button"
          disabled={voted !== null}
          onClick={() => setVoted(type)}
          className={`flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted transition ${hover} ${
            voted === type ? 'border-primary bg-primary/5 text-primary' : ''
          } disabled:opacity-70`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
      {voted && <span className="self-center text-xs text-accent">Vote recorded</span>}
    </motion.div>
  );
}
