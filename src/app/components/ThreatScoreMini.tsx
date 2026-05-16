import type { Severity } from '../types';
import { severityRingColor } from '../utils/severity';

export function ThreatScoreMini({ score, severity }: { score: number; severity: Severity }) {
  const color = severityRingColor(severity);
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e1e4e8" strokeWidth="3" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}
